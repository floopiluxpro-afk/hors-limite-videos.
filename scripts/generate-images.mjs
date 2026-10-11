// Génère les images "figurines en pâte à modeler" avec l'API Gemini.
// 1) une image de référence par personnage + une image de référence du décor,
// 2) chaque plan, en passant les références des personnages présents pour garder
//    le même physique et le même judogi d'une image à l'autre.
// Usage : npm run images -- <slug> [--only 07c,08a] [--force] [--refs] [--concurrency 3]
import fs from 'node:fs';
import path from 'node:path';
import {
  ensureDir,
  fetchWithRetry,
  getSlug,
  loadStoryboard,
  parseArgs,
  publicDir,
  requireEnv,
  sleep,
} from './lib.mjs';

const args = parseArgs();
const slug = getSlug(args);
const sb = loadStoryboard(slug);
const key = requireEnv('GEMINI_API_KEY');
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const imgDir = ensureDir(path.join(publicDir(slug), 'images'));
const refDir = ensureDir(path.join(publicDir(slug), 'refs'));
const only = args.only ? String(args.only).split(',') : null;
const concurrency = Number(args.concurrency || 3);

const EXT = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp'};

function existing(dir, id) {
  const f = fs.readdirSync(dir).find((n) => n.replace(/\.[^.]+$/, '') === id);
  return f ? path.join(dir, f) : null;
}

function asInline(file) {
  const ext = path.extname(file).slice(1);
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return {inline_data: {mime_type: mime, data: fs.readFileSync(file).toString('base64')}};
}

async function generate(prompt, refs, outBase, label) {
  const body = {
    contents: [{parts: [{text: prompt}, ...refs.map(asInline)]}],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: {aspectRatio: '9:16', ...(/pro|3/.test(MODEL) ? {imageSize: '2K'} : {})},
    },
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {method: 'POST', headers: {'x-goog-api-key': key, 'Content-Type': 'application/json'}, body: JSON.stringify(body)},
      {label: `Gemini ${label}`},
    );
    const json = await res.json();
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const img = parts.map((p) => p.inlineData || p.inline_data).find(Boolean);
    if (img) {
      const mime = img.mimeType || img.mime_type;
      for (const old of fs.readdirSync(path.dirname(outBase))) {
        if (old.replace(/\.[^.]+$/, '') === path.basename(outBase)) fs.rmSync(path.join(path.dirname(outBase), old));
      }
      const file = `${outBase}.${EXT[mime] ?? 'png'}`;
      fs.writeFileSync(file, Buffer.from(img.data, 'base64'));
      return file;
    }
    const reason = json.candidates?.[0]?.finishReason || json.promptFeedback?.blockReason || 'aucune image';
    console.warn(`  ${label} : pas d'image (${reason}), nouvel essai…`);
    await sleep(2000);
  }
  throw new Error(`${label} : échec de génération après 3 essais`);
}

const STYLE = sb.style;

// ---------- 1. Références ----------
const refPrompts = {
  decor:
    `Establishing shot of the 1964 Nippon Budokan judo arena interior: a square tatami mat in the center under bright lights, ` +
    `packed stands of tiny Japanese spectator figurines in 1960s clothing, wooden details, Japanese flags. ${STYLE}`,
};
for (const [id, c] of Object.entries(sb.characters || {})) {
  refPrompts[id] =
    `Character reference image. Full body, front view, standing in a neutral relaxed pose, centered, plain light grey studio background, ` +
    `soft even lighting. Character: ${c.description} ${STYLE}`;
}

const refs = {};
for (const [id, prompt] of Object.entries(refPrompts)) {
  const have = existing(refDir, id);
  if (have && !(args.refs && args.force)) {
    refs[id] = have;
    continue;
  }
  console.log(`Référence ${id}…`);
  refs[id] = await generate(prompt, [], path.join(refDir, id), `réf. ${id}`);
}

// ---------- 2. Plans ----------
function shotPrompt(shot) {
  const chars = (shot.characters || []).filter((c) => sb.characters?.[c]);
  let p = `Create one vertical 9:16 image for a short documentary video.\nScene: ${shot.image}\n`;
  if (chars.length) {
    p += `\nCharacters in this scene. Each one MUST look exactly like its reference image (same face, hair, body proportions, judogi, belt and flag patch):\n`;
    chars.forEach((c, i) => {
      p += `- ${sb.characters[c].name} (reference image ${i + 1}): ${sb.characters[c].description}\n`;
    });
    p += `The last reference image shows the world and the art style to match.\n`;
  } else {
    p += `\nThe reference image shows the world and the art style to match.\n`;
  }
  p += `\nStyle: ${STYLE}`;
  return {prompt: p, refs: [...chars.map((c) => refs[c]), refs.decor]};
}

const shots = sb.lines.flatMap((l) => l.shots);
const todo = shots.filter((s) => (only ? only.includes(s.id) : args.force || !existing(imgDir, s.id)));
console.log(`${todo.length} plan(s) à générer avec ${MODEL} (${shots.length - todo.length} déjà présents).`);

let next = 0;
let failed = 0;
async function worker() {
  while (next < todo.length) {
    const shot = todo[next++];
    const {prompt, refs: r} = shotPrompt(shot);
    try {
      const f = await generate(prompt, r, path.join(imgDir, shot.id), `plan ${shot.id}`);
      console.log(`  ✓ ${shot.id} → ${path.basename(f)}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${shot.id} : ${err.message}`);
    }
  }
}
await Promise.all(Array.from({length: concurrency}, worker));
if (failed) {
  console.error(`${failed} plan(s) en échec : relance "npm run images -- ${slug}" pour compléter.`);
  process.exit(1);
}
console.log('Images OK.');
