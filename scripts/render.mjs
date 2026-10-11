// Export final MP4 1080x1920 30 fps.
// Usage : npm run render -- <slug>
import path from 'node:path';
import {renderMedia} from '@remotion/renderer';
import {ensureDir, getSlug, outDir, parseArgs} from './lib.mjs';
import {prepare} from './remotion-common.mjs';

const args = parseArgs();
const slug = getSlug(args);
const {serveUrl, composition, inputProps, browserExecutable} = await prepare(slug);
const output = path.join(ensureDir(outDir(slug)), `${slug}.mp4`);
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  inputProps,
  codec: 'h264',
  crf: 18,
  audioBitrate: '320k',
  imageFormat: 'jpeg',
  jpegQuality: 92,
  outputLocation: output,
  browserExecutable,
  onProgress: ({progress}) => {
    const p = Math.floor(progress * 20);
    if (p !== last) {
      last = p;
      process.stdout.write(`\rRendu… ${Math.round(progress * 100)} %`);
    }
  },
});
console.log(`\nVidéo : ${path.relative(process.cwd(), output)} (${(composition.durationInFrames / composition.fps).toFixed(1)} s)`);
