// Dessine les plans d'une vidéo en SVG (videos/<slug>/art.mjs) puis les convertit en PNG avec Chromium.
// Alternative sans IA à generate-images.mjs : style "affiche Tokyo 1964" vectoriel.
// Usage : npm run draw -- <slug> [--only 01a,07c] [--scale 1.5]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ensureDir, getSlug, parseArgs, publicDir, videoDir} from './lib.mjs';
import {W, H} from './draw-lib.mjs';

const args = parseArgs();
const slug = getSlug(args);
const only = args.only ? String(args.only).split(',') : null;
const scale = Number(args.scale || 1.5);
const artFile = path.join(videoDir(slug), 'art.mjs');
if (!fs.existsSync(artFile)) throw new Error(`Pas de ${artFile}`);
const {scenes} = await import(pathToFileURL(artFile).href);

const imgDir = ensureDir(path.join(publicDir(slug), 'images'));
const svgDir = ensureDir(path.join(publicDir(slug), 'svg'));
const CHROME = process.env.CHROME_BIN || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const ids = Object.keys(scenes).filter((id) => !only || only.includes(id));
for (const id of ids) {
  const svg = scenes[id]();
  const svgFile = path.join(svgDir, `${id}.svg`);
  fs.writeFileSync(svgFile, svg);
  const html = path.join(svgDir, `${id}.html`);
  fs.writeFileSync(
    html,
    `<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:#000}svg{display:block;width:${W}px;height:${H}px}</style></head><body>${svg}</body></html>`,
  );
  // PNG temporaire puis JPEG (le grain de papier rend les PNG très lourds).
  const png = path.join(svgDir, `${id}.png`);
  const jpg = path.join(imgDir, `${id}.jpg`);
  for (const old of fs.readdirSync(imgDir)) if (old.replace(/\.[^.]+$/, '') === id && old !== `${id}.jpg`) fs.rmSync(path.join(imgDir, old));
  execFileSync(
    CHROME,
    [
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      `--force-device-scale-factor=${scale}`,
      `--window-size=${W},${H}`,
      `--screenshot=${png}`,
      pathToFileURL(html).href,
    ],
    {stdio: 'ignore'},
  );
  execFileSync('convert', [png, '-quality', '90', jpg]);
  fs.rmSync(html);
  fs.rmSync(png);
  console.log(`  ✓ ${id} → ${path.relative(process.cwd(), jpg)}`);
}
console.log(`${ids.length} image(s) dessinée(s).`);
