// Musique taiko + bruitages synthétisés localement : 100 % libres de droits, sans API.
// - public/sfx/{whoosh,hit,impact,tick}.wav (communs à toutes les vidéos)
// - public/<slug>/music.mp3 (ou .wav sans ffmpeg), calée sur la durée de la voix
// Usage : npm run audio -- <slug> [--force]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT, ensureDir, getSlug, hasFfmpeg, loadStoryboard, parseArgs, publicDir, readJson} from './lib.mjs';

const SR = 44100;

// ---------- utilitaires DSP ----------
let seed = 1234567;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

function writeWav(file, left, right = left) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i])) * 32767), 46 + i * 4);
  }
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, buf);
}

function normalize(chs, peak = 0.9) {
  let m = 0;
  for (const c of chs) for (const v of c) m = Math.max(m, Math.abs(v));
  if (m > 0) for (const c of chs) for (let i = 0; i < c.length; i++) c[i] *= peak / m;
}

/** Filtre passe-bande / passe-bas à état variable (Chamberlin), fréquence modulable. */
function svf(input, freqAt, q = 0.7, mode = 'band') {
  const out = new Float32Array(input.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < input.length; i++) {
    const f = 2 * Math.sin((Math.PI * Math.min(freqAt(i / SR), SR / 6)) / SR);
    low += f * band;
    const high = input[i] - low - q * band;
    band += f * high;
    out[i] = mode === 'band' ? band : mode === 'low' ? low : high;
  }
  return out;
}

/** Petite réverbération (peignes en parallèle) pour donner de l'espace. */
function reverb(x, mix = 0.25, decay = 0.6) {
  const delays = [1557, 1617, 1491, 1422].map((d) => d * 2);
  const out = Float32Array.from(x);
  for (const d of delays) {
    const buf = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) buf[i] = x[i] + (i >= d ? buf[i - d] * decay : 0);
    for (let i = 0; i < x.length; i++) out[i] += (buf[i] * mix) / delays.length;
  }
  return out;
}

function tone(len, {f0, f1, fall, decay, partials = [[1, 1]]}) {
  const n = Math.floor(len * SR);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = f1 + (f0 - f1) * Math.exp(-t * fall);
    phase += (2 * Math.PI * f) / SR;
    let s = 0;
    for (const [mult, amp] of partials) s += Math.sin(phase * mult) * amp * Math.exp(-t * decay * mult);
    out[i] = s;
  }
  return out;
}

// ---------- instruments ----------
function taikoHit(vel = 1, size = 1) {
  const len = 1.4;
  const body = tone(len, {f0: 120 / size, f1: 62 / size, fall: 25, decay: 5, partials: [[1, 1], [1.52, 0.35], [2.3, 0.12]]});
  const n = body.length;
  const att = new Float32Array(n);
  for (let i = 0; i < n; i++) att[i] = noise() * Math.exp((-i / SR) * 45);
  const attF = svf(att, () => 900, 0.8, 'low');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = (body[i] * 0.9 + attF[i] * 0.6) * vel;
  return out;
}

function kaHit(vel = 1) {
  const n = Math.floor(0.12 * SR);
  const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = noise() * Math.exp((-i / SR) * 70);
  const band = svf(nz, () => 2800, 0.5, 'band');
  const t = tone(0.12, {f0: 950, f1: 820, fall: 40, decay: 45});
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = (band[i] * 1.2 + t[i] * 0.4) * vel;
  return out;
}

function mixAt(dst, src, time, gain = 1) {
  const o = Math.floor(time * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
}

// ---------- bruitages ----------
function makeWhoosh() {
  const len = 0.55;
  const n = Math.floor(len * SR);
  const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = noise();
  const sweep = (t) => 300 + 3200 * Math.sin(Math.PI * Math.min(1, t / len)) ** 2;
  const b = svf(nz, sweep, 0.35, 'band');
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const env = Math.sin(Math.PI * Math.pow(p, 0.8)) ** 2;
    L[i] = b[i] * env * (1 - p * 0.6);
    R[i] = b[i] * env * (0.4 + p * 0.6);
  }
  normalize([L, R], 0.85);
  return [L, R];
}

function makeHit() {
  const thump = tone(0.7, {f0: 160, f1: 48, fall: 18, decay: 7});
  const n = thump.length;
  const crack = new Float32Array(n);
  for (let i = 0; i < n; i++) crack[i] = noise() * Math.exp((-i / SR) * 35);
  const hp = svf(crack, () => 1800, 0.7, 'high');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = thump[i] + hp[i] * 0.5;
  const wet = reverb(out, 0.3, 0.5);
  normalize([wet]);
  return [wet, wet];
}

function makeImpact() {
  const boom = tone(2.6, {f0: 95, f1: 34, fall: 6, decay: 1.6, partials: [[1, 1], [2, 0.3]]});
  const n = boom.length;
  const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = noise() * Math.exp((-i / SR) * 7);
  const low = svf(nz, (t) => 2500 * Math.exp(-t * 3) + 120, 0.6, 'low');
  const taiko = taikoHit(1, 1.25);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = boom[i] * 1.1 + low[i] * 0.8 + (i < taiko.length ? taiko[i] * 0.9 : 0);
  const wet = reverb(out, 0.45, 0.7);
  for (let i = 0; i < n; i++) wet[i] = Math.tanh(wet[i] * 1.6);
  normalize([wet], 0.95);
  return [wet, wet];
}

function makeTick() {
  const t = tone(0.09, {f0: 2400, f1: 1800, fall: 60, decay: 60});
  normalize([t], 0.7);
  return [t, t];
}

// ---------- musique ----------
function makeMusic(duration, bpm) {
  const n = Math.ceil(duration * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const step = 60 / bpm / 4; // double croche
  // motifs sur 16 pas : O = grosse frappe, o = frappe moyenne, k = "ka" (bord du tambour)
  const patterns = ['O..kO.o.O.k.o.kk', 'O..kO.o.O.k.oook', 'O.k.O.okO.k.o.k.', 'O.oOo.oOOoOoOOOO'];
  const big = taikoHit(1, 1);
  const mid = taikoHit(0.6, 0.8);
  const bars = Math.ceil(duration / (step * 16));
  for (let b = 0; b < bars; b++) {
    const pat = b % 4 === 3 ? patterns[3] : patterns[b % 3];
    for (let s = 0; s < 16; s++) {
      const t = (b * 16 + s) * step + (rnd() - 0.5) * 0.008;
      const ch = pat[s];
      if (ch === 'O') {
        mixAt(L, big, t, 0.9);
        mixAt(R, big, t, 0.9);
      } else if (ch === 'o') {
        mixAt(L, mid, t, 0.75);
        mixAt(R, mid, t, 0.55);
      } else if (ch === 'k') {
        const ka = kaHit(0.5 + rnd() * 0.3);
        mixAt(L, ka, t, 0.35);
        mixAt(R, ka, t, 0.6);
      }
    }
  }
  // Nappe grave discrète (quinte) pour la tension
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const trem = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.25 * t);
    const pad = (Math.sin(2 * Math.PI * 55 * t) + 0.5 * Math.sin(2 * Math.PI * 82.4 * t)) * 0.12 * trem;
    L[i] += pad;
    R[i] += pad;
  }
  const wl = reverb(L, 0.35, 0.6);
  const wr = reverb(R, 0.35, 0.62);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fade = Math.min(1, t / 0.4, (duration - t) / 1.5);
    wl[i] = Math.tanh(wl[i] * 0.9) * Math.max(0, fade);
    wr[i] = Math.tanh(wr[i] * 0.9) * Math.max(0, fade);
  }
  normalize([wl, wr], 0.85);
  return [wl, wr];
}


// ---------- bruitages BD ----------
function makeCrack() {
  const n = Math.floor(0.5 * SR);
  const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // salve de craquements : plusieurs petits clics rapprochés
    const burst = [0, 0.012, 0.03, 0.05, 0.08].some((b) => t >= b && t < b + 0.006) ? 1 : 0.25;
    nz[i] = noise() * burst * Math.exp(-t * 14);
  }
  const hp = svf(nz, () => 2500, 0.6, 'high');
  const body = tone(0.4, {f0: 220, f1: 90, fall: 25, decay: 12});
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = hp[i] * 1.2 + (i < body.length ? body[i] * 0.6 : 0);
  const wet = reverb(out, 0.2, 0.4);
  normalize([wet]);
  return [wet, wet];
}

function makeTap() {
  // deux tapes sèches sur le tapis
  const n = Math.floor(0.55 * SR);
  const out = new Float32Array(n);
  for (const at of [0, 0.2]) {
    const thump = tone(0.18, {f0: 140, f1: 80, fall: 30, decay: 28});
    const nz = new Float32Array(thump.length);
    for (let i = 0; i < nz.length; i++) nz[i] = noise() * Math.exp((-i / SR) * 60);
    const slap = svf(nz, () => 1400, 0.8, 'band');
    mixAt(out, thump.map((v, i) => v + slap[i] * 1.5), at);
  }
  normalize([out], 0.85);
  return [out, out];
}

function makePop() {
  const t = tone(0.22, {f0: 300, f1: 900, fall: 25, decay: 18});
  normalize([t], 0.7);
  return [t, t];
}

// ---------- boucle rythmique ----------
function makeBeat(duration, bpm) {
  const n = Math.ceil(duration * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const step = 60 / bpm / 4;
  const kick = tone(0.35, {f0: 150, f1: 45, fall: 30, decay: 9});
  const snareN = new Float32Array(Math.floor(0.22 * SR));
  for (let i = 0; i < snareN.length; i++) snareN[i] = noise() * Math.exp((-i / SR) * 20);
  const snareBody = tone(0.22, {f0: 240, f1: 180, fall: 20, decay: 25});
  const snare = svf(snareN, () => 2200, 0.7, 'band').map((v, i) => v * 1.6 + snareBody[i] * 0.5);
  const hatN = new Float32Array(Math.floor(0.05 * SR));
  for (let i = 0; i < hatN.length; i++) hatN[i] = noise() * Math.exp((-i / SR) * 90);
  const hat = svf(hatN, () => 8000, 0.5, 'high');
  // basse : motif de 2 mesures (mi, sol, la, ré)
  const bassNotes = [41.2, 41.2, 49.0, 55.0, 41.2, 41.2, 36.7, 49.0];
  const bars = Math.ceil(duration / (step * 16));
  for (let b = 0; b < bars; b++) {
    const fill = b % 4 === 3;
    for (let s = 0; s < 16; s++) {
      const t = (b * 16 + s) * step;
      if ([0, 7, 10].includes(s) || (fill && s >= 12)) mixAt(L, kick, t, 0.9), mixAt(R, kick, t, 0.9);
      if (s === 4 || s === 12 || (fill && s % 2 === 1 && s > 8)) mixAt(L, snare, t, 0.45), mixAt(R, snare, t, 0.5);
      if (s % 2 === 0) mixAt(L, hat, t, 0.18), mixAt(R, hat, t, 0.28);
      if (s % 4 === 0 || s % 4 === 3) {
        const f = bassNotes[(b % 2) * 4 + Math.floor(s / 4)];
        const len = step * (s % 4 === 0 ? 2.6 : 0.9);
        const bass = new Float32Array(Math.floor(len * SR));
        for (let i = 0; i < bass.length; i++) {
          const tt = i / SR;
          const saw = 2 * ((tt * f) % 1) - 1;
          bass[i] = (Math.sin(2 * Math.PI * f * tt) * 0.7 + saw * 0.25) * Math.min(1, tt * 200) * Math.exp(-tt * 3);
        }
        mixAt(L, bass, t, 0.5);
        mixAt(R, bass, t, 0.5);
      }
    }
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fade = Math.max(0, Math.min(1, t / 0.3, (duration - t) / 1.2));
    L[i] = Math.tanh(L[i] * 1.1) * fade;
    R[i] = Math.tanh(R[i] * 1.1) * fade;
  }
  normalize([L, R], 0.85);
  return [L, R];
}

// ---------- main ----------
const args = parseArgs();
const sfxDir = ensureDir(path.join(ROOT, 'public', 'sfx'));
const sfx = {whoosh: makeWhoosh, hit: makeHit, impact: makeImpact, tick: makeTick, crack: makeCrack, tap: makeTap, pop: makePop};
for (const [name, fn] of Object.entries(sfx)) {
  const f = path.join(sfxDir, `${name}.wav`);
  if (!fs.existsSync(f) || args.force) {
    writeWav(f, ...fn());
    console.log(`sfx/${name}.wav`);
  }
}

if (args._[0]) {
  const slug = getSlug(args);
  const sb = loadStoryboard(slug);
  const wordsFile = path.join(publicDir(slug), 'words.json');
  const duration = fs.existsSync(wordsFile) ? readJson(wordsFile).duration + 2 : 60;
  const wav = path.join(publicDir(slug), 'music.wav');
  const music = sb.music?.style === 'beat' ? makeBeat : makeMusic; // "beat" : boucle batterie + basse ; sinon taiko
  writeWav(wav, ...music(duration, sb.music?.bpm ?? 100));
  if (hasFfmpeg()) {
    const mp3 = wav.replace(/\.wav$/, '.mp3');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-b:a', '192k', mp3]);
    fs.rmSync(wav);
    console.log(`${slug}/music.mp3 (${duration.toFixed(1)} s)`);
  } else console.log(`${slug}/music.wav (${duration.toFixed(1)} s)`);
}
