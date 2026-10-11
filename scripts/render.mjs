// Export final MP4 1080x1920 30 fps.
// Usage : npm run render -- <slug>
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
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
// Normalisation du volume (2 passes loudnorm) : -14 LUFS intégrés, crêtes à -1,5 dBTP.
const LUFS = Number(args.lufs ?? -14);
const filter = `loudnorm=I=${LUFS}:TP=-1.5:LRA=11`;
const pass1 = spawnSync('ffmpeg', ['-hide_banner', '-i', output, '-af', `${filter}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'});
const m = JSON.parse(pass1.stderr.slice(pass1.stderr.lastIndexOf('{')));
const tmp = output.replace(/\.mp4$/, '.tmp.mp4');
execFileSync('ffmpeg', [
  '-y', '-v', 'error', '-i', output,
  '-af', `${filter}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', tmp,
]);
fs.renameSync(tmp, output);
const check = spawnSync('ffmpeg', ['-hide_banner', '-i', output, '-af', 'ebur128', '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
const integrated = check.match(/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold[\s\S]*$/)?.[1] ?? check.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop();
console.log(`\nVolume : ${m.input_i} LUFS → ${integrated} LUFS (cible ${LUFS})`);
console.log(`\nVidéo : ${path.relative(process.cwd(), output)} (${(composition.durationInFrames / composition.fps).toFixed(1)} s)`);
