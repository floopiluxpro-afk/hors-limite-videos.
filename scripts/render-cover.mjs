// Couverture TikTok 1080x1920 (JPG) à partir du bloc "cover" du storyboard :
//   "cover": {"image": "01a", "title": ["Un géant a fait", "*pleurer*", "tout le Japon"], "badge": "1964"}
// *mot* = ligne en jaune, plus grosse. Sans bloc "cover" : premier plan + titre du storyboard.
// Usage : npm run cover -- <slug>
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {ROOT, browserExecutable, ensureDir, findImage, getSlug, loadStoryboard, outDir, parseArgs} from './lib.mjs';

const args = parseArgs();
const slug = getSlug(args);
const sb = loadStoryboard(slug);
const c = sb.cover || {};
const comic = sb.format === 'comic';
let inputProps;
if (comic) {
  // Vidéo en cases : "cover": {"panel": "00b", "t": 0.3, "title": [...], "badge": "UFC 194", "keep": ["sfx"]}
  inputProps = {slug, panel: c.panel ?? sb.lines[0].panels[0].id, t: c.t ?? 0.5, title: c.title || [sb.title], badge: c.badge, keep: c.keep};
} else {
  const imageId = c.image || sb.lines[0].shots[0].id;
  const image = findImage(slug, imageId);
  if (!image) throw new Error(`Image "${imageId}" introuvable : lance d'abord "npm run images -- ${slug}"`);
  inputProps = {image, title: c.title || [sb.title], badge: c.badge, imageScale: c.imageScale, imageOrigin: c.imageOrigin};
}

const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public')});
const composition = await selectComposition({serveUrl, id: comic ? 'ComicCover' : 'Cover', inputProps, browserExecutable: browserExecutable()});
const output = path.join(ensureDir(outDir(slug)), 'couverture.jpg');
await renderStill({serveUrl, composition, inputProps, output, imageFormat: 'jpeg', jpegQuality: 95, browserExecutable: browserExecutable()});
console.log(`Couverture : ${path.relative(process.cwd(), output)}`);
