// Crée le dossier d'une nouvelle vidéo.
// Usage : npm run new -- <slug>   puis colle ton texte dans videos/<slug>/script.txt (une phrase par ligne)
import fs from 'node:fs';
import path from 'node:path';
import {ensureDir, parseArgs, videoDir} from './lib.mjs';

const slug = parseArgs()._[0];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Usage : npm run new -- mon-sujet (minuscules, chiffres, tirets)');
const dir = videoDir(slug);
if (fs.existsSync(dir)) throw new Error(`videos/${slug} existe déjà`);
ensureDir(dir);
fs.writeFileSync(path.join(dir, 'script.txt'), 'Une phrase par ligne.\nAbonne-toi pour plus d\'histoires Hors Limite.\n');
console.log(`Créé : videos/${slug}/script.txt\nÉtape suivante : écris le script puis "npm run storyboard -- ${slug}"`);
