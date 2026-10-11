// Outils partagés par tous les scripts du pipeline.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Charge un éventuel fichier .env à la racine (clés API) sans dépendance externe.
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {_: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) args[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[k] = argv[++i];
      else args[k] = true;
    } else args._.push(a);
  }
  return args;
}

export function getSlug(args) {
  const slug = args._[0] || process.env.VIDEO;
  if (!slug) {
    const list = fs.readdirSync(path.join(ROOT, 'videos'));
    throw new Error(`Précise la vidéo : npm run <étape> -- <slug>\nVidéos disponibles : ${list.join(', ')}`);
  }
  if (!fs.existsSync(videoDir(slug))) throw new Error(`Dossier introuvable : videos/${slug}`);
  return slug;
}

export const videoDir = (slug) => path.join(ROOT, 'videos', slug);
export const publicDir = (slug) => path.join(ROOT, 'public', slug);
export const outDir = (slug) => path.join(ROOT, 'out', slug);

export function ensureDir(dir) {
  fs.mkdirSync(dir, {recursive: true});
  return dir;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

export function loadStoryboard(slug) {
  const file = path.join(videoDir(slug), 'storyboard.json');
  if (!fs.existsSync(file)) throw new Error(`Pas de storyboard : lance d'abord "npm run storyboard -- ${slug}"`);
  return readJson(file);
}

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Variable d'environnement ${name} manquante. Ajoute-la dans l'environnement ou dans un fichier .env à la racine.`,
    );
  }
  return v;
}

/**
 * Découpe une ligne de script balisée.
 * Syntaxe : "{affiché|prononcé}" permet d'afficher "1,98 m" tout en faisant lire
 * "un mètre quatre-vingt-dix-huit" à la voix off.
 * Renvoie le texte prononcé et la liste des mots affichés avec leur plage de
 * caractères dans le texte prononcé.
 */
export function parseLine(text) {
  const pieces = [];
  const re = /\{([^|}]*)\|([^}]*)\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) pieces.push({display: text.slice(last, m.index), spoken: text.slice(last, m.index), group: false});
    pieces.push({display: m[1], spoken: m[2], group: true});
    last = m.index + m[0].length;
  }
  if (last < text.length) pieces.push({display: text.slice(last), spoken: text.slice(last), group: false});

  let spoken = '';
  const words = [];
  let cur = null;
  const close = () => {
    if (cur) words.push(cur);
    cur = null;
  };
  for (const p of pieces) {
    if (p.group) {
      if (!cur) cur = {text: '', start: spoken.length, end: spoken.length};
      cur.text += p.display;
      spoken += p.spoken;
      cur.end = spoken.length;
      continue;
    }
    for (const ch of p.spoken) {
      if (/\s/.test(ch)) {
        close();
        spoken += ch;
        continue;
      }
      if (!cur) cur = {text: '', start: spoken.length, end: spoken.length};
      cur.text += ch;
      spoken += ch;
      cur.end = spoken.length;
    }
  }
  close();
  return {spoken, words};
}

/** Texte complet prononcé + mots affichés avec leur ligne d'origine. */
export function buildSpeech(storyboard) {
  let full = '';
  const words = [];
  storyboard.lines.forEach((line, li) => {
    if (li > 0) full += ' ';
    const {spoken, words: lw} = parseLine(line.text);
    const offset = full.length;
    full += spoken;
    for (const w of lw) words.push({text: w.text, start: w.start + offset, end: w.end + offset, line: li});
  });
  return {text: full, words};
}

export const displayLine = (text) => text.replace(/\{([^|}]*)\|[^}]*\}/g, '$1');

export function normalizeWord(w) {
  return w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9',]/g, '')
    .replace(/,$/, '');
}

export async function fetchWithRetry(url, options, {retries = 4, label = 'requête'} = {}) {
  let delay = 2000;
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url, options);
    } catch (err) {
      if (attempt >= retries) throw err;
      console.warn(`  ${label} : erreur réseau (${err.message}), nouvel essai dans ${delay / 1000}s`);
      await sleep(delay);
      delay *= 2;
      continue;
    }
    if (res.ok) return res;
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      console.warn(`  ${label} : HTTP ${res.status}, nouvel essai dans ${delay / 1000}s`);
      await sleep(delay);
      delay *= 2;
      continue;
    }
    throw new Error(`${label} : HTTP ${res.status} ${body.slice(0, 500)}`);
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function hasFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

export function probeDuration(file) {
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
    return parseFloat(out.toString());
  } catch {
    return null;
  }
}

/** Navigateur pour Remotion : variable REMOTION_BROWSER, sinon téléchargement automatique par Remotion. */
export function browserExecutable() {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const local = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  return fs.existsSync(local) ? local : null;
}

export function findImage(slug, id) {
  const dir = path.join(publicDir(slug), 'images');
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => n.replace(/\.[^.]+$/, '') === id);
  return f ? `${slug}/images/${f}` : null;
}
