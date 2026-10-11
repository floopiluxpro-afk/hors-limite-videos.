// Bundle Remotion + sélection de la composition, partagés par preview et render.
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';
import {ROOT, browserExecutable} from './lib.mjs';

export async function prepare(slug) {
  console.log('Bundle Remotion…');
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public')});
  const inputProps = {slug};
  const composition = await selectComposition({
    serveUrl,
    id: 'HorsLimite',
    inputProps,
    browserExecutable: browserExecutable(),
  });
  return {serveUrl, composition, inputProps, browserExecutable: browserExecutable()};
}
