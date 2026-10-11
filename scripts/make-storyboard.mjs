// Propose un storyboard (plans, personnages, incrustations) à partir de videos/<slug>/script.txt
// grâce à Gemini, en prenant la vidéo Geesink comme modèle de format et de style.
// Usage : npm run storyboard -- <slug> [--force] [--format comic]
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
const comic = args.format === 'comic';
const example = readJson(path.join(ROOT, comic ? 'videos/royce-gracie-ufc-1/storyboard.json' : 'videos/geesink-1964/storyboard.json'));

const COMIC_RULES = `Format BANDE DESSINÉE ("format": "comic"), tout est dessiné en code, AUCUN prompt d'image.
- Chaque phrase a 1 à 3 "panels" (cases), une nouvelle case ou un nouveau mouvement toutes les 2 secondes au plus.
- Repère : 1080 de large, sol à y = 1060 ; les personnages ont leurs pieds au sol (y omis = sol).
- Éléments : "puppet" (style "hero" = héros en kimono blanc, "shadow" = adversaire en silhouette noire ;
  build parmi slim, normal, heavy, muscle, tall, sumo ; "s" = taille (héros ≈ 2 à 4, adversaires 1,3 à 2 fois plus grands) ;
  "facing" 1 ou -1 ; "poses" = [[pose, instant]] avec pose parmi ${'stand guard punch kick shoot walk1 walk2 armsUp flex crossed lying tapA tapB fallen mount sit choke choked chokedTap bow'} ;
  "cycle" pour alterner des poses ; "move" pour déplacer ; "glove": true pour un gant de boxe),
  "prop" (name parmi city, cage, scale, rulebook, tooth, confetti, globe, balance),
  "caption" (encadré jaune de narration), "sfx" (onomatopée géante + "sound" parmi hit, crack, tap, boom, pop),
  "title", "name" (carton nom + "flag" parmi br, nl, us, jp, fr), "timer", "counter", "logo", "inset" (case incrustée, ex. flash-back sépia).
- "at" et les instants des poses : nombre (secondes depuis le début de la case) ou mot de la phrase, avec décalage possible ("coup-0.15").
- "fx" : punch (zoom brusque), shake (tremblement), flash, sur les moments forts.
- "bg" parmi blue, yellow, red, purple, cyan, orange, green, pink ; "rays": true pour les lignes de vitesse ;
  "transition" parmi slam, slide, flash, cut ; "camera": {"zoom": [début, fin], "focus": [x, y]}.`;
const prompt = `Tu es monteur pour "Hors Limite", un compte TikTok faceless d'anecdotes de culture générale sur les sports de combat.
Transforme le script ci-dessous en storyboard JSON, EXACTEMENT au même format que l'exemple.

Règles :
${comic ? COMIC_RULES + '\n' : ''}- Une entrée "lines" par ligne du script, texte identique (garde la ponctuation).
- Utilise la syntaxe {affiché|prononcé} pour les nombres, unités, années et noms étrangers difficiles à prononcer
  (ex. "{1,98 m|un mètre quatre-vingt-dix-huit}", "{Geesink|Guésink}").
${comic ? '' : `- 2 à 3 plans par phrase (1 seul pour la phrase d'appel à l'abonnement), 20 à 30 plans au total, environ un plan toutes les 1,5 à 2 secondes de voix
  (compter ~15 caractères par seconde). Les plans après le premier d'une phrase ont un "cue" : un mot de la phrase où la coupe tombe.
- "image" : description en anglais d'une scène en figurines 3D de pâte à modeler (jamais réaliste, jamais d'images d'archives, aucun texte dans l'image).
- "characters" : définis les personnages récurrents avec une description physique et vestimentaire TRÈS précise et constante
  (morphologie, cheveux, tenue, couleur, signe distinctif), et liste leurs identifiants dans chaque plan où ils apparaissent.
- "motion" parmi zoomIn, zoomOut, panLeft, panRight, panUp ; "transition" parmi whip, zoom, flash, cut ;
  "impact": "hard" pour LE moment fort (zoom brusque + tremblement), "soft" pour 1 à 4 temps forts secondaires.
- "overlays" : chiffres et noms animés (types counter, title, name, stamp, medals, logo, comme dans l'exemple), avec un "cue".
  Un drapeau ("flag") parmi jp, nl, fr, th, br, us si pertinent. Dernière phrase : overlay logo "HORS LIMITE" / "ABONNE-TOI".
- "music": "cut" sur une phrase de silence/émotion éventuelle ; "pauseAfter" (0.3 à 0.9 s) après la phrase du moment fort.
`}- Garde "style" identique à l'exemple. Choisis un "slug" = "${slug}".

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
