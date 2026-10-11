// Pipeline complet : voix → images → musique/bruitages → timeline → captures → (rendu avec --render).
// Usage : npm run make -- <slug> [--render]
import {execFileSync} from 'node:child_process';
import {getSlug, parseArgs} from './lib.mjs';

const args = parseArgs();
const slug = getSlug(args);
const run = (script, ...extra) => execFileSync('node', [`scripts/${script}.mjs`, slug, ...extra], {stdio: 'inherit'});
run('generate-voice');
run('generate-images');
run('generate-audio');
run('build-timeline');
run('print-storyboard');
run('preview-stills');
if (args.render) run('render');
else console.log(`\nVérifie out/${slug}/planche-contact.jpg puis lance : npm run render -- ${slug}`);
