// Assemble storyboard + timings de la voix + images en une timeline lue par Remotion.
// - chaque plan démarre sur son mot "cue" (ou à intervalles réguliers dans la phrase),
// - un plan de plus de ~2 s est redécoupé en sous-plans (recadrage) pour garder
//   un changement de plan toutes les 1,5 à 2 s,
// - placement automatique des bruitages (whoosh, impacts).
// Usage : npm run timeline -- <slug>
import fs from 'node:fs';
import path from 'node:path';
import {
  FPS,
  buildSpeech,
  HEIGHT,
  WIDTH,
  findImage, findFrames,
  getSlug,
  loadStoryboard,
  normalizeWord,
  parseArgs,
  publicDir,
  readJson,
  writeJson,
} from './lib.mjs';

const MAX_SHOT = 2.4; // au-delà, on redécoupe le plan (sous-plans d'environ 1,5-2 s)
const LEAD = 0.08; // la coupe tombe juste avant le mot
const TAIL = 1.6; // fin de vidéo après la dernière syllabe
const DEFAULT_TRANSITIONS = ['whip', 'zoom', 'whip', 'flash'];
const MOTIONS = ['zoomIn', 'panRight', 'zoomOut', 'panLeft', 'panUp'];

/** Timings approximatifs (sans voix) : sert au découpage et aux maquettes. */
export function estimateWords(sb) {
  const {text, words} = buildSpeech(sb);
  const speed = sb.voice?.speed ?? 1.05;
  let t = 0.25;
  const out = words.map((w, i) => {
    const spoken = text.slice(w.start, w.end);
    const dur = (0.052 * spoken.length + 0.04) / speed;
    const res = {text: w.text, line: w.line, start: +t.toFixed(3), end: +(t + dur).toFixed(3)};
    t += dur + (/[.!?…:]$/.test(w.text) ? 0.42 : /,$/.test(w.text) ? 0.2 : 0.03) / speed;
    const line = sb.lines[w.line];
    if (words[i + 1]?.line !== w.line) t += line.pauseAfter ?? 0;
    return res;
  });
  return {duration: t, words: out};
}

export function buildTimeline(slug, {estimate = false} = {}) {
  const sb = loadStoryboard(slug);
  const wordsFile = path.join(publicDir(slug), 'words.json');
  const hasVoice = fs.existsSync(wordsFile) && !estimate;
  if (!hasVoice && !estimate) throw new Error(`words.json manquant : lance "npm run voice -- ${slug}" (ou --estimate)`);
  const voice = hasVoice ? readJson(wordsFile) : estimateWords(sb);
  const words = voice.words;
  const total = Math.max(voice.duration, words.at(-1).end) + TAIL;

  const lineWords = sb.lines.map((_, li) => words.filter((w) => w.line === li));
  const lineStart = sb.lines.map((_, li) => (li === 0 ? 0 : Math.max(0, lineWords[li][0].start - LEAD)));
  const lineEnd = sb.lines.map((_, li) => (li + 1 < sb.lines.length ? lineStart[li + 1] : total));

  // Trouve le mot "cue" dans la ligne, en partant de l'index `from`.
  function findCue(li, cue, from = 0) {
    const target = normalizeWord(cue);
    const lw = lineWords[li];
    for (let i = from; i < lw.length; i++) {
      if (normalizeWord(lw[i].text).startsWith(target)) return i;
    }
    console.warn(`⚠ Ligne ${li + 1} : mot-repère "${cue}" introuvable.`);
    return -1;
  }

  const shots = [];
  const overlays = [];
  const missing = [];
  let shotCounter = 0;

  sb.lines.forEach((line, li) => {
    const s0 = lineStart[li];
    const s1 = lineEnd[li];
    // Bornes des plans de la ligne : départ connu (cue) ou null (réparti).
    let cursor = 0;
    const starts = line.shots.map((shot, k) => {
      if (k === 0) return s0;
      if (!shot.cue) return null;
      const idx = findCue(li, shot.cue, cursor);
      if (idx < 0) return null;
      cursor = idx;
      return Math.max(s0 + 0.5, lineWords[li][idx].start - LEAD);
    });
    // Répartit les plans sans repère entre les plans connus.
    for (let k = 1; k < starts.length; k++) {
      if (starts[k] !== null) continue;
      let j = k;
      while (j < starts.length && starts[j] === null) j++;
      const a = starts[k - 1];
      const b = j < starts.length ? starts[j] : s1;
      const n = j - k + 1;
      for (let m = k; m < j; m++) starts[m] = a + ((b - a) * (m - k + 1)) / n;
    }

    line.shots.forEach((shot, k) => {
      const start = starts[k];
      const end = k + 1 < starts.length ? starts[k + 1] : s1;
      const image = findImage(slug, shot.id);
      const anim = findFrames(slug, shot.id);
      if (!image) missing.push(shot.id);
      const dur = end - start;
      const parts = dur > MAX_SHOT ? Math.ceil(dur / 2.0) : 1;
      for (let p = 0; p < parts; p++) {
        const isFirst = shots.length === 0;
        const transition = isFirst
          ? 'none'
          : p > 0
            ? 'jump'
            : shot.transition || DEFAULT_TRANSITIONS[shotCounter % DEFAULT_TRANSITIONS.length];
        shots.push({
          id: parts > 1 ? `${shot.id}.${p + 1}` : shot.id,
          image,
          start: +(start + (dur * p) / parts).toFixed(3),
          end: +(start + (dur * (p + 1)) / parts).toFixed(3),
          motion: p === 0 ? shot.motion || MOTIONS[shotCounter % MOTIONS.length] : MOTIONS[(shotCounter + p * 2) % MOTIONS.length],
          variant: p,
          transition,
          direction: shots.length % 2 === 0 ? 1 : -1,
          impact: p === 0 ? shot.impact || null : null,
          ...(anim ? {frames: anim.frames, animFps: anim.fps, animMode: anim.mode, animStart: +start.toFixed(3), animEnd: +end.toFixed(3)} : {}),
        });
      }
      shotCounter++;
    });

    for (const o of line.overlays || []) {
      let start = s0 + 0.1;
      if (o.cue) {
        const idx = findCue(li, o.cue, 0);
        if (idx >= 0) {
          start = lineWords[li][idx].start;
        }
      }
      const {cue, duration = 1.8, ...rest} = o;
      // Une incrustation ne déborde pas sur la phrase suivante (sauf le logo de fin).
      const limit = o.type === 'logo' ? total : Math.min(total, s1 + 0.15);
      overlays.push({...rest, start: +start.toFixed(3), end: +Math.min(limit, start + duration).toFixed(3)});
    }
  });

  if (missing.length) console.warn(`⚠ ${missing.length} image(s) manquante(s) (${missing.join(', ')}) : remplacées par des cartons.`);

  // Les incrustations occupent la même zone : chacune s'efface quand la suivante arrive.
  overlays.sort((a, b) => a.start - b.start);
  overlays.forEach((o, i) => {
    const next = overlays[i + 1];
    if (next && next.start < o.end) o.end = +Math.max(o.start + 0.3, next.start).toFixed(3);
  });

  // Sections où la musique se coupe (moment de silence).
  const musicCuts = sb.lines
    .map((l, li) => (l.music === 'cut' ? {start: lineStart[li], end: lineEnd[li]} : null))
    .filter(Boolean);

  // Bruitages
  let sfx = [];
  for (const s of shots) {
    if (s.transition === 'whip' || s.transition === 'zoom') sfx.push({src: 'sfx/whoosh.wav', start: s.start - 0.12, volume: 0.5});
    if (s.transition === 'flash' && s.impact !== 'hard') sfx.push({src: 'sfx/hit.wav', start: s.start, volume: 0.45});
    if (s.impact === 'hard') sfx.push({src: 'sfx/impact.wav', start: s.start, volume: 0.8});
    if (s.impact === 'soft') sfx.push({src: 'sfx/hit.wav', start: s.start, volume: 0.7});
  }
  for (const o of overlays) {
    if (o.type === 'stamp') sfx.push({src: 'sfx/hit.wav', start: o.start, volume: 0.6});
    if (o.type === 'counter' || o.type === 'medals') sfx.push({src: 'sfx/tick.wav', start: o.start, volume: 0.35});
  }
  sfx.sort((a, b) => a.start - b.start || b.volume - a.volume);
  sfx = sfx
    .filter((e, i, arr) => !arr.slice(0, i).some((p) => p.src === e.src && Math.abs(p.start - e.start) < 0.15))
    .map((e) => ({...e, start: +Math.max(0, e.start).toFixed(3)}));

  const timeline = {
    slug,
    title: sb.title,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    duration: +total.toFixed(3),
    durationInFrames: Math.ceil(total * FPS),
    voice: hasVoice ? `${slug}/voice.mp3` : null,
    estimated: !hasVoice,
    music: ['mp3', 'wav'].map((e) => `${slug}/music.${e}`).find((f) => fs.existsSync(path.join(publicDir(slug), '..', f))) ?? null,
    musicCuts,
    words,
    shots,
    overlays,
    sfx,
  };
  writeJson(path.join(publicDir(slug), 'timeline.json'), timeline);

  const lens = shots.map((s) => s.end - s.start);
  console.log(
    `Timeline : ${total.toFixed(1)} s, ${shots.length} plans (${new Set(shots.map((s) => s.image)).size} images), ` +
      `plan moyen ${(lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(2)} s, ` +
      `min ${Math.min(...lens).toFixed(2)} s, max ${Math.max(...lens).toFixed(2)} s`,
  );
  if (total < 45 || total > 60) console.warn(`⚠ Durée totale ${total.toFixed(1)} s hors de la cible 45-60 s.`);
  return timeline;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs();
  buildTimeline(getSlug(args), {estimate: Boolean(args.estimate)});
}
