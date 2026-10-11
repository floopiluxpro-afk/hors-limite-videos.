// Génère la voix off avec ElevenLabs + les timings mot par mot (endpoint with-timestamps).
// Usage : npm run voice -- <slug> [--force] [--repause] [--list]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {
  buildSpeech,
  fetchWithRetry,
  getSlug,
  loadStoryboard,
  parseArgs,
  probeDuration,
  publicDir,
  readJson,
  requireEnv,
  ensureDir,
  writeJson,
} from './lib.mjs';

const API = 'https://api.elevenlabs.io/v1';
// Voix de secours (voix "premade" disponible sur tous les comptes, lit bien le français en multilingual v2).
const FALLBACK_VOICE = 'JBFqnCBsd6RMkjVDRZzb';
const SR = 44100;

const args = parseArgs();
const needsApi = !args.repause;
const key = needsApi ? requireEnv('ELEVENLABS_API_KEY') : '';
const headers = {'xi-api-key': key, 'Content-Type': 'application/json'};

async function listVoices() {
  const res = await fetchWithRetry(`${API}/voices`, {headers}, {label: 'liste des voix'});
  return (await res.json()).voices;
}

if (args.list) {
  for (const v of await listVoices()) {
    const l = v.labels || {};
    console.log(`${v.voice_id}  ${v.name.padEnd(28)} ${[l.language, l.accent, l.gender, l.age, l.use_case].filter(Boolean).join(' / ')}`);
  }
  process.exit(0);
}

const slug = getSlug(args);
const sb = loadStoryboard(slug);
const outDir = ensureDir(publicDir(slug));
const rawMp3 = path.join(outDir, 'voice.raw.mp3');
const rawWords = path.join(outDir, 'words.raw.json');
const mp3 = path.join(outDir, 'voice.mp3');
const wordsFile = path.join(outDir, 'words.json');

async function pickVoice() {
  const explicit = process.env.ELEVENLABS_VOICE_ID || sb.voice?.voiceId;
  if (explicit) return explicit;
  const voices = await listVoices();
  const fr = voices.find((v) => /fr|french|fran/i.test(`${v.labels?.language ?? ''} ${v.labels?.accent ?? ''} ${v.name}`));
  if (fr) {
    console.log(`Voix française trouvée sur le compte : ${fr.name}`);
    return fr.voice_id;
  }
  console.warn(
    "Aucune voix française sur le compte : voix par défaut utilisée. Ajoute une voix FR native depuis la Voice Library\n" +
      'puis définis ELEVENLABS_VOICE_ID (liste : npm run voice -- --list).',
  );
  return FALLBACK_VOICE;
}

async function synthesize() {
  const {text, words} = buildSpeech(sb);
  const voiceId = await pickVoice();
  const v = sb.voice || {};
  console.log(`Synthèse de ${text.length} caractères avec la voix ${voiceId}…`);
  const res = await fetchWithRetry(
    `${API}/text-to-speech/${voiceId}/with-timestamps?output_format=${process.env.ELEVENLABS_FORMAT || 'mp3_44100_128'}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || v.model || 'eleven_multilingual_v2',
        language_code: 'fr',
        voice_settings: {
          stability: v.stability ?? 0.4,
          similarity_boost: v.similarity_boost ?? 0.8,
          style: v.style ?? 0.45,
          use_speaker_boost: true,
          speed: v.speed ?? 1.05,
        },
      }),
    },
    {label: 'ElevenLabs TTS'},
  );
  const data = await res.json();
  fs.writeFileSync(rawMp3, Buffer.from(data.audio_base64, 'base64'));

  const al = data.alignment;
  const chars = al.characters;
  let mapIndex = (i) => i;
  if (chars.join('') !== text) {
    // Sécurité : si l'alignement ne correspond pas caractère pour caractère, on recale proportionnellement.
    console.warn("L'alignement renvoyé diffère du texte envoyé : recalage proportionnel.");
    mapIndex = (i) => Math.min(chars.length - 1, Math.round((i / text.length) * chars.length));
  }
  const timed = words.map((w) => ({
    text: w.text,
    line: w.line,
    start: +al.character_start_times_seconds[mapIndex(w.start)].toFixed(3),
    end: +al.character_end_times_seconds[mapIndex(w.end - 1)].toFixed(3),
  }));
  writeJson(rawWords, {voiceId, words: timed});
}

/**
 * Insère des silences après certaines phrases ("pauseAfter" dans le storyboard)
 * et décale les timings. Ne rappelle pas l'API : modifiable à volonté (--repause).
 */
function applyPauses() {
  const raw = readJson(rawWords);
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', rawMp3, '-f', 's16le', '-ac', '1', '-ar', String(SR), '-'], {
    maxBuffer: 1 << 30,
  });
  const words = raw.words.map((w) => ({...w}));
  const cuts = [];
  sb.lines.forEach((line, li) => {
    if (!line.pauseAfter) return;
    const last = words.filter((w) => w.line === li).at(-1);
    const next = words.find((w) => w.line === li + 1);
    if (!last) return;
    // Silence inséré au milieu du blanc entre les deux phrases.
    const at = next ? (last.end + next.start) / 2 : last.end;
    cuts.push({at, pause: line.pauseAfter});
  });
  const chunks = [];
  let pos = 0;
  let shift = 0;
  for (const c of cuts.sort((a, b) => a.at - b.at)) {
    const byte = Math.min(pcm.length, Math.round(c.at * SR) * 2);
    chunks.push(pcm.subarray(pos, byte), Buffer.alloc(Math.round(c.pause * SR) * 2));
    pos = byte;
  }
  chunks.push(pcm.subarray(pos));
  for (const w of words) {
    shift = cuts.filter((c) => c.at <= w.start).reduce((s, c) => s + c.pause, 0);
    w.start = +(w.start + shift).toFixed(3);
    w.end = +(w.end + shift).toFixed(3);
  }
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 's16le', '-ac', '1', '-ar', String(SR), '-i', '-', '-b:a', '192k', mp3], {
    input: Buffer.concat(chunks),
    maxBuffer: 1 << 30,
  });
  const duration = probeDuration(mp3) ?? words.at(-1).end + 0.3;
  writeJson(wordsFile, {voiceId: raw.voiceId, duration: +duration.toFixed(3), words});
  console.log(`OK : voice.mp3 (${duration.toFixed(1)} s) + words.json (${words.length} mots)`);
  if (duration < 43 || duration > 58) {
    console.warn(`⚠ Durée voix ${duration.toFixed(1)} s : ajuste "voice.speed" dans le storyboard pour viser 45-60 s au total.`);
  }
}

if (!args.repause) {
  if (fs.existsSync(rawMp3) && fs.existsSync(rawWords) && !args.force) {
    console.log('Voix déjà générée (--force pour régénérer, --repause pour seulement recalculer les pauses).');
  } else await synthesize();
}
applyPauses();
