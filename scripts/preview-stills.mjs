// Captures de contrôle : une image par plan (+ moments forts) et une planche contact.
// Usage : npm run preview -- <slug> [--at 12.5,31]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {renderStill} from '@remotion/renderer';
import {ensureDir, getSlug, hasFfmpeg, outDir, parseArgs, publicDir, readJson} from './lib.mjs';
import {prepare} from './remotion-common.mjs';

const args = parseArgs();
const slug = getSlug(args);
const comicFile = path.join(publicDir(slug), 'comic.json');
const isComic = fs.existsSync(comicFile);
const timeline = readJson(isComic ? comicFile : path.join(publicDir(slug), 'timeline.json'));
const dir = ensureDir(path.join(outDir(slug), 'stills'));
for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f));

const {serveUrl, composition, inputProps, browserExecutable} = await prepare(slug);
const fps = timeline.fps;

// Un instant par image source : 0,55 s après le début du plan (incrustations visibles), borné au plan.
const moments = [];
const seen = new Set();
// BD : un instant par case, juste après son dernier événement (pose, onomatopée…).
for (const p of isComic ? timeline.panels : []) {
  const dur = p.end - p.start;
  const ats = [...p.elements.flatMap((e) => [e.at ?? 0, ...(e.poses ?? []).map((k) => k.t)]), ...p.fx.map((f) => f.at)];
  const t = Math.min(dur - 0.04, Math.max(0.35, Math.max(...ats) + 0.3));
  moments.push({name: p.id, t: p.start + t});
}
for (const s of isComic ? [] : timeline.shots) {
  const base = s.id.split('.')[0];
  if (seen.has(base)) continue;
  seen.add(base);
  moments.push({name: base, t: Math.min(s.start + 0.55, (s.start + s.end) / 2 + 0.3)});
}
for (const t of String(args.at || '').split(',').filter(Boolean)) moments.push({name: `t${t}`, t: Number(t)});

for (const m of moments) {
  const frame = Math.min(timeline.durationInFrames - 1, Math.round(m.t * fps));
  const output = path.join(dir, `${m.name}.jpg`);
  await renderStill({serveUrl, composition, inputProps, frame, output, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable});
  console.log(`  ${m.name} @ ${m.t.toFixed(2)} s`);
}

if (hasFfmpeg()) {
  const files = moments.filter((m) => !m.name.startsWith('t')).map((m) => path.join(dir, `${m.name}.jpg`));
  const cols = 6;
  const rows = Math.ceil(files.length / cols);
  const sheet = path.join(outDir(slug), 'planche-contact.jpg');
  const inputs = files.flatMap((f) => ['-i', f]);
  const filter =
    files.map((_, i) => `[${i}:v]scale=270:480,drawtext=text='${moments[i].name}':x=10:y=10:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(';') +
    ';' +
    files.map((_, i) => `[v${i}]`).join('') +
    `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|')}:fill=black`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', filter, '-frames:v', '1', '-q:v', '3', sheet]);
  console.log(`Planche contact : ${path.relative(process.cwd(), sheet)} (${cols}x${rows})`);
}
