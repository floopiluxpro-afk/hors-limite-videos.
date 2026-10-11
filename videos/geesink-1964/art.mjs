// Plans de "Geesink 1964" dessinés en SVG, style affiche Tokyo 1964 (voir scripts/draw-lib.mjs).
// Rendu : npm run draw -- geesink-1964 [--only 01a]
import {P, W, H, svgDoc, rect, circle, poly, line, group, rng, sun, rays, burst, spotlight, tatami, crowd, flagJP, flagNL, figure, figureFront} from '../../scripts/draw-lib.mjs';

function skyline(yBase, {seed = 2, color = '#3a2230', h0 = 60, h1 = 220} = {}) {
  const rand = rng(seed);
  let out = '';
  for (let x = -20; x < W + 20; ) {
    const w = 40 + rand() * 70;
    const h = h0 + rand() * (h1 - h0);
    out += rect(x, yBase - h, w, h + 400, color);
    for (let wy = yBase - h + 18; wy < yBase - 12; wy += 26) {
      for (let wx = x + 10; wx < x + w - 14; wx += 20) if (rand() < 0.35) out += rect(wx, wy, 8, 11, P.goldLight, 'opacity="0.85"');
    }
    x += w + 4;
  }
  return out;
}

function tokyoTower(x, base, h) {
  const w = h * 0.36;
  let out = poly([[x - w / 2, base], [x + w / 2, base], [x + w * 0.06, base - h], [x - w * 0.06, base - h]], P.red, `stroke="${P.ink}" stroke-width="4"`);
  const bands = 6;
  for (let i = 1; i < bands; i += 2) {
    const t0 = i / bands;
    const t1 = (i + 1) / bands;
    const wa = w / 2 - (w / 2 - w * 0.06) * t0;
    const wb = w / 2 - (w / 2 - w * 0.06) * t1;
    out += poly([[x - wa, base - h * t0], [x + wa, base - h * t0], [x + wb, base - h * t1], [x - wb, base - h * t1]], P.white);
  }
  out += rect(x - w * 0.22, base - h * 0.42, w * 0.44, h * 0.05, P.ink);
  out += line(x, base - h, x, base - h * 1.15, P.ink, 5);
  // lattice
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    const wa = w / 2 - (w / 2 - w * 0.06) * t;
    const wb = w / 2 - (w / 2 - w * 0.06) * (t + 0.1);
    out += line(x - wa, base - h * t, x + wb, base - h * (t + 0.1), P.ink, 2, 'opacity="0.5"');
    out += line(x + wa, base - h * t, x - wb, base - h * (t + 0.1), P.ink, 2, 'opacity="0.5"');
  }
  return out;
}

function heightChart(x, top, bottom, w) {
  let out = rect(x, top, w, bottom - top, P.wood, `stroke="${P.ink}" stroke-width="6"`);
  out += rect(x + 10, top + 10, w - 20, bottom - top - 20, P.paperDark);
  for (let y = bottom - 30, i = 0; y > top + 20; y -= 22, i++) {
    const long = i % 5 === 0;
    out += line(x + 10, y, x + 10 + (long ? w * 0.55 : w * 0.28), y, P.ink, long ? 5 : 3, 'stroke-linecap="butt"');
  }
  return out;
}

function dust(cx, cy, {n = 9, r = 70, seed = 4, color = P.paperDark} = {}) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = r * (0.5 + rand());
    out += circle(cx + Math.cos(a) * d * 1.6, cy + Math.sin(a) * d * 0.5, r * (0.35 + rand() * 0.5), color, `stroke="${P.ink}" stroke-width="4" opacity="0.95"`);
  }
  return out;
}

function speedLines(cx, cy, {n = 14, seed = 9, len = 260, color = P.ink, spread = 520} = {}) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const y = cy + (rand() - 0.5) * spread;
    const x = cx + (rand() - 0.5) * 200;
    out += line(x, y, x - len * (0.5 + rand()), y + 30, color, 6 + rand() * 6, 'opacity="0.7"');
  }
  return out;
}

export const scenes = {
  // Le géant au-dessus de Tokyo au crépuscule.
  '01a': () =>
    svgDoc(
      rect(0, 0, W, H, P.sky) +
        rect(0, 0, W, 520, '#e8873f') +
        rays(540, 700, {n: 18, color: P.red, opacity: 0.16}) +
        sun(540, 700, 420, P.red) +
        figureFront('geesink', {x: 540, ground: 1560, size: 1480, armL: {sh: 6, el: 0}, armR: {sh: 6, el: 0}, legSpread: 9, face: true}) +
        skyline(1430, {seed: 3, color: '#4a2a35', h0: 70, h1: 200}) +
        tokyoTower(250, 1440, 330) +
        skyline(1520, {seed: 8, color: '#2c1a24', h0: 40, h1: 120}) +
        rect(0, 1520, W, H - 1520, '#2c1a24'),
      {bg: P.sky},
    ),

  // Kaminaga et Geesink côte à côte devant une toise.
  '06b': () =>
    svgDoc(
      rect(0, 0, W, H, P.navy) +
        rays(540, 260, {n: 14, color: P.gold, opacity: 0.1}) +
        heightChart(170, 120, 1500, 740) +
        rect(0, 1500, W, H - 1500, P.tatami) +
        rect(0, 1500, W, 26, P.tatamiGreen) +
        figureFront('kaminaga', {x: 340, ground: 1560, size: 1250, face: true, mood: 'neutral'}) +
        figureFront('geesink', {x: 720, ground: 1560, size: 1250, face: true}) +
        '',
      {bg: P.navy},
    ),

  // Geesink projette Kaminaga sur le tatami.
  '07a': () =>
    svgDoc(
      rect(0, 0, W, H, P.red) +
        burst(600, 820, {n: 26, color: P.goldLight, r0: 40, r1: 1300, opacity: 0.35, seed: 11}) +
        `<g transform="rotate(-8 540 960)">` +
        rect(-200, 1400, W + 400, 900, P.tatami) +
        rect(-200, 1400, W + 400, 30, P.tatamiGreen) +
        figure('geesink', {
          hip: [300, 1080],
          size: 1150,
          f: 1,
          lean: 22,
          headTilt: 20,
          arms: [{sh: 135, el: 15}, {sh: 115, el: 10}],
          legs: [{hip: -26, knee: 8}, {hip: 26, knee: 30}],
          face: true,
          mood: 'fierce',
        }) +
        group(
          figure('kaminaga', {
            hip: [0, 0],
            size: 1150,
            f: 1,
            lean: 0,
            arms: [{sh: 150, el: 20}, {sh: 120, el: 40}],
            legs: [{hip: 40, knee: 50}, {hip: -15, knee: 25}],
            face: true,
            mood: 'shout',
          }),
          {x: 690, y: 500, rot: 118},
        ) +
        dust(900, 1405, {n: 11, r: 55, seed: 5}) +
        speedLines(300, 500, {n: 9, len: 200, spread: 500, seed: 4}) +
        `</g>`,
      {bg: P.red},
    ),
};
