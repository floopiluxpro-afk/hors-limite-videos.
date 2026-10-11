// Propose un storyboard (plans, personnages, incrustations) à partir de videos/<slug>/script.txt
// grâce à Gemini, en prenant la vidéo Geesink comme modèle de format et de style.
// Usage : npm run storyboard -- <slug> [--force]
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, fetchWithRetry, getSlug, parseArgs, readJson, requireEnv, videoDir, writeJson} from './lib.mjs';

const args = parseArgs();
const slug = getSlug(args);
const out = path.join(videoDir(slug), 'storyboard.json');
if (fs.existsSync(out) && !args.force) {
  console.log(`storyboard.json existe déjà (--force pour le remplacer). Découpage : npm run decoupage -- ${slug}`);
  process.exit(0);
}
const key = requireEnv('GEMINI_API_KEY');
const MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const script = fs.readFileSync(path.join(videoDir(slug), 'script.txt'), 'utf8').trim();
const example = readJson(path.join(ROOT, 'videos/geesink-1964/storyboard.json'));

const prompt = `Tu es monteur pour "Hors Limite", un compte TikTok faceless d'anecdotes de culture générale sur les sports de combat.
Transforme le script ci-dessous en storyboard JSON, EXACTEMENT au même format que l'exemple.

Règles :
- Une entrée "lines" par ligne du script, texte identique (garde la ponctuation).
- Utilise la syntaxe {affiché|prononcé} pour les nombres, unités, années et noms étrangers difficiles à prononcer
  (ex. "{1,98 m|un mètre quatre-vingt-dix-huit}", "{Geesink|Guésink}").
- 2 à 3 plans par phrase (1 seul pour la phrase d'appel à l'abonnement), 20 à 30 plans au total, environ un plan toutes les 1,5 à 2 secondes de voix
  (compter ~15 caractères par seconde). Les plans après le premier d'une phrase ont un "cue" : un mot de la phrase où la coupe tombe.
- "image" : description en anglais d'une scène en figurines 3D de pâte à modeler (jamais réaliste, jamais d'images d'archives, aucun texte dans l'image).
- "characters" : définis les personnages récurrents avec une description physique et vestimentaire TRÈS précise et constante
  (morphologie, cheveux, tenue, couleur, signe distinctif), et liste leurs identifiants dans chaque plan où ils apparaissent.
- "motion" parmi zoomIn, zoomOut, panLeft, panRight, panUp ; "transition" parmi whip, zoom, flash, cut ;
  "impact": "hard" pour LE moment fort (zoom brusque + tremblement), "soft" pour 1 à 4 temps forts secondaires.
- "overlays" : chiffres et noms animés (types counter, title, name, stamp, medals, logo, comme dans l'exemple), avec un "cue".
  Un drapeau ("flag") parmi jp, nl, fr, th, br, us si pertinent. Dernière phrase : overlay logo "HORS LIMITE" / "ABONNE-TOI".
- "music": "cut" sur une phrase de silence/émotion éventuelle ; "pauseAfter" (0.3 à 0.9 s) après la phrase du moment fort.
- Garde "style" identique à l'exemple. Choisis un "slug" = "${slug}".

Exemple :
${JSON.stringify(example, null, 2)}

Script :
${script}`;

console.log(`Génération du storyboard avec ${MODEL}…`);
const res = await fetchWithRetry(
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
  {
    method: 'POST',
    headers: {'x-goog-api-key': key, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      contents: [{parts: [{text: prompt}]}],
      generationConfig: {responseMimeType: 'application/json', temperature: 0.7},
    }),
  },
  {label: 'Gemini storyboard'},
);
const json = await res.json();
const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
const sb = JSON.parse(text);
sb.slug = slug;
sb.style ??= example.style;
writeJson(out, sb);
console.log(`OK : ${path.relative(process.cwd(), out)} (${sb.lines.length} phrases, ${sb.lines.reduce((n, l) => n + l.shots.length, 0)} plans)`);
console.log(`Relis-le puis : npm run decoupage -- ${slug}`);
