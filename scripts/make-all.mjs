// Pipeline complet : voix → images → musique/bruitages → timeline → captures → (rendu avec --render).
// Usage : npm run make -- <slug> [--render]
import {execFileSync} from 'node:child_process';
import {getSlug, loadStoryboard, parseArgs} from './lib.mjs';

const args = parseArgs();
const slug = getSlug(args);
// NODE_USE_ENV_PROXY : fetch passe par le proxy HTTPS de l'environnement s'il y en a un
const env = {...process.env, ...(process.env.HTTPS_PROXY ? {NODE_USE_ENV_PROXY: '1'} : {})};
const run = (script, ...extra) => execFileSync('node', [`scripts/${script}.mjs`, slug, ...extra], {stdio: 'inherit', env});
const comic = loadStoryboard(slug).format === 'comic';
run('generate-voice');
if (comic) {
  // BD : tout est dessiné en code, pas d'images à générer
  run('generate-audio');
  run('build-comic');
} else {
  run('generate-images');
  run('generate-audio');
  run('build-timeline');
  run('print-storyboard');
}
run('preview-stills');
if (args.render) run('render');
else console.log(`\nVérifie out/${slug}/planche-contact.jpg puis lance : npm run render -- ${slug}`);
