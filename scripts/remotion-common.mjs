// Bundle Remotion + sélection de la composition, partagés par preview et render.
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';
import {ROOT, browserExecutable, publicDir} from './lib.mjs';

/** Composition à utiliser : "Comic" si la vidéo a une timeline BD. */
export const compositionId = (slug) => (fs.existsSync(path.join(publicDir(slug), 'comic.json')) ? 'Comic' : 'HorsLimite');

export async function prepare(slug) {
  console.log('Bundle Remotion…');
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public')});
  const inputProps = {slug};
  const composition = await selectComposition({
    serveUrl,
    id: compositionId(slug),
    inputProps,
    browserExecutable: browserExecutable(),
  });
  return {serveUrl, composition, inputProps, browserExecutable: browserExecutable()};
}
