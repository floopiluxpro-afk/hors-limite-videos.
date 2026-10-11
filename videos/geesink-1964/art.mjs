// Plans de "Geesink 1964" dessinés en SVG, style affiche Tokyo 1964 (voir scripts/draw-lib.mjs).
// Rendu : npm run draw -- geesink-1964 [--only 01a]
import {P, W, H, CHAR, svgDoc, rect, circle, poly, line, group, rng, sun, rays, burst, spotlight, tatami, crowd, flagJP, flagNL, figure, figureFront, head, medal, olympicRings, blurred} from '../../scripts/draw-lib.mjs';

const prog = (k, n) => (n > 1 ? k / (n - 1) : 1);
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Plans animés image par image (stop-motion) : n images, 'once' = action jouée une fois, 'loop'/'pingpong' = boucle.
export const anim = {
  '01a': {n: 4, mode: 'loop', fps: 6},
  '01c': {n: 4, mode: 'loop', fps: 6},
  '03a': {n: 4, mode: 'loop', fps: 8},
  '04a': {n: 4, mode: 'loop', fps: 5},
  '05a': {n: 2, mode: 'loop', fps: 5},
  '06c': {n: 3, mode: 'pingpong', fps: 8},
  '07a': {n: 6, mode: 'once'},
  '07c': {n: 4, mode: 'once'},
  '08b': {n: 4, mode: 'loop', fps: 6},
  '08c': {n: 4, mode: 'loop', fps: 6},
  '09a': {n: 3, mode: 'pingpong', fps: 9},
  '09b': {n: 2, mode: 'loop', fps: 7},
  '09c': {n: 4, mode: 'once'},
  '10b': {n: 5, mode: 'once'},
  '10c': {n: 2, mode: 'loop', fps: 6},
  '11a': {n: 3, mode: 'pingpong', fps: 5},
  '11b': {n: 2, mode: 'loop', fps: 4},
};

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
  '01a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.sky) +
        rect(0, 0, W, 520, '#e8873f') +
        rays(540, 700, {n: 18, color: P.red, opacity: 0.16, rot: (k * 20) / 4}) +
        sun(540, 700, 420, P.red) +
        figureFront('geesink', {x: 540, ground: 1560, size: 1480, armL: {sh: 6, el: 0}, armR: {sh: 6, el: 0}, legSpread: 9, face: true}) +
        skyline(1430, {seed: 3, color: '#4a2a35', h0: 70, h1: 200}) +
        tokyoTower(250, 1440, 330) +
        skyline(1520, {seed: 8, color: '#2c1a24', h0: 40, h1: 120}) +
        rect(0, 1520, W, H - 1520, '#2c1a24'),
      {bg: P.sky},
    ),

  // Kaminaga et Geesink côte à côte devant une toise.
  '06b': (k = 0, n = 1) =>
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
  '07a': (k = 0, n = 1) => {
    const t = easeIO(prog(k, n));
    return svgDoc(
      rect(0, 0, W, H, P.red) +
        burst(600, 820, {n: 26, color: P.goldLight, r0: 40, r1: 1300, opacity: 0.35, seed: 11}) +
        `<g transform="rotate(-8 540 960)">` +
        rect(-200, 1400, W + 400, 900, P.tatami) +
        rect(-200, 1400, W + 400, 30, P.tatamiGreen) +
        figure('geesink', {
          hip: [300, 1080],
          size: 1150,
          f: 1,
          lean: lerp(8, 22, t),
          headTilt: 20,
          arms: [{sh: lerp(95, 135, t), el: lerp(40, 15, t)}, {sh: lerp(85, 115, t), el: lerp(40, 10, t)}],
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
          {x: lerp(660, 690, t), y: lerp(1000, 500, t), rot: lerp(15, 118, t)},
        ) +
        (t > 0.55 ? dust(900, 1405, {n: 11, r: 55 * t, seed: 5}) + speedLines(300, 500, {n: 9, len: 200, spread: 500, seed: 4}) : '') +
        `</g>`,
      {bg: P.red},
    );
  },
};

// ---------- Personnages secondaires ----------
const SPECTATOR = {...CHAR.spectator, build: 1.1};
const ELDER = {height: 0.76, build: 1.05, skin: P.skinJp, hair: '#e9e4da', hairStyle: 'bald', outfit: 'suit', glasses: false};
const KIMONO = {height: 0.74, build: 0.95, skin: P.skinJp, hair: P.black, hairStyle: 'bun', outfit: 'kimono'};
const JUDOKA = (o) => ({height: 0.78, build: 1, skin: P.skinJp, hair: P.black, hairStyle: 'crop', outfit: 'judogi', ...o});

function stands(yTop, yBottom, opts = {}) {
  return rect(0, yTop - 40, W, yBottom - yTop + 120, opts.bg || '#2a2233') + crowd(yTop, yBottom, opts);
}

function cherryTree(x, base, s, seed) {
  const rand = rng(seed);
  let out = line(x, base, x, base - 120 * s, P.woodDark, 22 * s);
  for (let i = 0; i < 9; i++) out += circle(x + (rand() - 0.5) * 150 * s, base - 150 * s + (rand() - 0.5) * 90 * s, (34 + rand() * 26) * s, i % 3 ? '#f4b6c2' : '#ee9fb0');
  return out;
}

function bunting(x0, y0, x1, y1, sag, n, seed) {
  const rand = rng(seed);
  const cols = [P.red, P.white, P.gold, P.blue, '#3d8a5a'];
  let out = `<path d="M ${x0} ${y0} Q ${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag} ${x1} ${y1}" fill="none" stroke="${P.ink}" stroke-width="4"/>`;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2 + sag) + t * t * y1;
    out += poly([[x - 20, y], [x + 20, y], [x, y + 46]], cols[Math.floor(rand() * cols.length)], `stroke="${P.ink}" stroke-width="3"`);
  }
  return out;
}

function flagPole(x, base, h, s = 1) {
  return line(x, base, x, base - h, P.ink, 6 * s) + rect(x, base - h, 90 * s, 60 * s, P.ink) + flagJP(x + 3 * s, base - h + 3 * s, 84 * s, 54 * s);
}

function confetti(seed, n = 70, cols = [P.goldLight, P.gold, P.white, P.red], fall = 0) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = rand() * W;
    const y = (rand() * 1350 + fall) % 1350;
    out += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(14 + rand() * 14).toFixed(0)}" height="${(26 + rand() * 18).toFixed(0)}" fill="${cols[i % cols.length]}" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  return out;
}

function particles(seed, cx, top, bottom, spread, n = 40, drift = 0) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = (rand() + drift) % 1;
    const y = top + (bottom - top) * t;
    const x = cx + (rand() - 0.5) * spread * t * 2;
    out += circle(x, y, 2 + rand() * 4, '#fff6d8', `opacity="${(0.4 + rand() * 0.5).toFixed(2)}"`);
  }
  return out;
}

function podium(cx, base) {
  const block = (x, w, h) => rect(x - w / 2, base - h, w, h, P.white, `stroke="${P.ink}" stroke-width="8"`) + rect(x - w / 2, base - h, w, 26, P.red, `stroke="${P.ink}" stroke-width="8"`);
  return block(cx - 300, 300, 200) + block(cx + 300, 300, 140) + block(cx, 300, 290);
}


// Buste en gros plan (tête + épaules), pour les plans serrés.
function bust(ch, {cx = 540, cy = 800, r = 430, mood = 'neutral', ol = 12, tear = 0} = {}) {
  const shoulderY = cy + r * 1.05;
  const outfitTop = ch.outfit === 'judogi' ? P.white : ch.outfit === 'kimono' ? '#b8324a' : '#2b2a33';
  let out = `<path d="M ${cx - 600} 1920 L ${cx - 600} ${shoulderY + r * 0.55} Q ${cx - 420} ${shoulderY} ${cx} ${shoulderY} Q ${cx + 420} ${shoulderY} ${cx + 600} ${shoulderY + r * 0.55} L ${cx + 600} 1920 Z" fill="${outfitTop}" stroke="${P.ink}" stroke-width="${ol}"/>`;
  if (ch.outfit === 'judogi') {
    out += `<path d="M ${cx - r * 0.5} ${shoulderY + 10} L ${cx + r * 0.05} ${shoulderY + r * 1.0} M ${cx + r * 0.5} ${shoulderY + 10} L ${cx - r * 0.05} ${shoulderY + r * 0.8}" stroke="${P.ink}" stroke-width="${ol}" fill="none"/>`;
  } else if (ch.outfit === 'kimono') {
    out += `<path d="M ${cx - r * 0.55} ${shoulderY + 10} L ${cx + r * 0.1} ${shoulderY + r * 1.1} M ${cx + r * 0.55} ${shoulderY + 10} L ${cx} ${shoulderY + r * 0.85}" stroke="${P.white}" stroke-width="${ol * 3}" fill="none"/>`;
  } else {
    out += poly([[cx - r * 0.32, shoulderY], [cx + r * 0.32, shoulderY], [cx, shoulderY + r * 0.9]], P.white, `stroke="${P.ink}" stroke-width="${ol * 0.6}"`);
    out += poly([[cx - r * 0.08, shoulderY + 6], [cx + r * 0.08, shoulderY + 6], [cx + r * 0.11, shoulderY + r * 0.85], [cx, shoulderY + r * 0.98], [cx - r * 0.11, shoulderY + r * 0.85]], ch.tie || '#7a1f2b', `stroke="${P.ink}" stroke-width="${ol * 0.5}"`);
  }
  out += rect(cx - r * 0.25, cy + r * 0.7, r * 0.5, shoulderY - cy - r * 0.6, ch.skin, `stroke="${P.ink}" stroke-width="${ol}"`);
  out += head([cx, cy], r, ch, {front: true, face: true, mood, ol, tear});
  return out;
}

Object.assign(scenes, {
  // Gros plan sur le visage de Geesink.
  '01b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.night) +
        rays(540, 760, {n: 20, color: P.gold, opacity: 0.08}) +
        circle(540, 780, 520, P.gold, 'opacity="0.9"') +
        // épaules et col du judogi
        `<path d="M -60 1920 L -60 1480 Q 120 1250 540 1250 Q 960 1250 1140 1480 L 1140 1920 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="12"/>` +
        `<path d="M 330 1265 L 560 1700 M 750 1265 L 520 1600" stroke="${P.ink}" stroke-width="12" fill="none"/>` +
        rect(700, 1420, 130, 88, P.ink) +
        flagNL(706, 1426, 118, 76) +
        rect(430, 1130, 220, 200, CHAR.geesink.skin, `stroke="${P.ink}" stroke-width="12"`) +
        head([540, 800], 430, CHAR.geesink, {front: true, face: true, mood: 'neutral', ol: 12}),
      {bg: P.night},
    ),

  // Spectateur japonais en larmes.
  '01c': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#2a2233') +
        blurred(crowd(80, 1100, {seed: 21, rows: 6, scale: 1.8, mood: 'sad'}), 7) +
        rect(0, 0, W, H, P.navy, 'opacity="0.35"') +
        bust(SPECTATOR, {cy: 820, r: 380, mood: 'cry', tear: k / Math.max(1, n)}),
      {bg: '#2a2233'},
    ),

  // Tokyo 1964, matin ensoleillé.
  '02a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#f6dfa6') +
        sun(820, 330, 150, P.red) +
        poly([[120, 980], [560, 420], [1000, 980]], P.navy) +
        poly([[440, 573], [560, 420], [680, 573], [630, 600], [590, 570], [540, 610], [500, 575]], P.white) +
        bunting(-20, 620, 1100, 560, 120, 13, 4) +
        rect(0, 960, W, H, '#9fb36a') +
        // stade
        `<ellipse cx="540" cy="1150" rx="400" ry="150" fill="${P.greyLight}" stroke="${P.ink}" stroke-width="8"/>` +
        `<path d="M 140 1150 L 160 1000 Q 540 900 920 1000 L 940 1150 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="8"/>` +
        `<ellipse cx="540" cy="1000" rx="380" ry="100" fill="${P.grey}" stroke="${P.ink}" stroke-width="8"/>` +
        `<ellipse cx="540" cy="1010" rx="280" ry="62" fill="#8fa060"/>` +
        line(200, 1005, 180, 860, P.ink, 6) + line(880, 1005, 900, 860, P.ink, 6) +
        rect(180, 860, 70, 46, P.ink) + flagJP(183, 863, 64, 40) + rect(900, 860, 70, 46, P.ink) + flagJP(903, 863, 64, 40) +
        cherryTree(110, 1330, 1.2, 3) + cherryTree(960, 1300, 1.1, 8) + cherryTree(300, 1420, 0.9, 12) + cherryTree(800, 1440, 0.95, 15) +
        rect(0, 1440, W, H, '#8fa060'),
      {bg: '#f6dfa6'},
    ),

  // Tatami vide sous un projecteur, anneaux olympiques.
  '02b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.night) +
        spotlight(540, 0, 1500, 560, 0.35) +
        olympicRings(540, 430, 120) +
        poly([[110, 1250], [970, 1250], [1040, 1420], [40, 1420]], P.woodDark, `stroke="${P.ink}" stroke-width="8"`) +
        rect(40, 1420, 1000, 90, P.wood, `stroke="${P.ink}" stroke-width="8"`) +
        tatami(1080, 1300, {topW: 720, bottomW: 980}) +
        `<ellipse cx="540" cy="1200" rx="420" ry="90" fill="#fff6d8" opacity="0.18"/>`,
      {bg: P.night},
    ),

  // Le Nippon Budokan.
  '02c': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#f6dfa6') +
        rays(540, 520, {n: 16, color: P.red, opacity: 0.12}) +
        sun(540, 520, 300, P.red) +
        // toit
        `<path d="M 60 980 Q 300 900 400 620 L 680 620 Q 780 900 1020 980 Z" fill="#4f6b5a" stroke="${P.ink}" stroke-width="10" stroke-linejoin="round"/>` +
        `<path d="M 380 640 Q 540 560 700 640" fill="none" stroke="${P.ink}" stroke-width="10"/>` +
        circle(540, 545, 46, P.gold, `stroke="${P.ink}" stroke-width="8"`) +
        poly([[540, 440], [575, 520], [505, 520]], P.gold, `stroke="${P.ink}" stroke-width="8"`) +
        // murs octogonaux
        poly([[150, 980], [930, 980], [900, 1320], [180, 1320]], '#e8dcc0', `stroke="${P.ink}" stroke-width="10"`) +
        rect(150, 980, 780, 40, '#c9b98f', `stroke="${P.ink}" stroke-width="6"`) +
        [260, 380, 500, 620, 740].map((x) => rect(x, 1080, 70, 240, '#6b5a44', `stroke="${P.ink}" stroke-width="6"`)).join('') +
        flagPole(90, 1340, 420, 1.2) + flagPole(990, 1340, 420, 1.2) +
        rect(0, 1320, W, H, '#cdbd94') +
        crowd(1360, 1560, {seed: 31, rows: 4, scale: 1.4}),
      {bg: '#f6dfa6'},
    ),

  // Trois judokas japonais sur le podium.
  '03a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.red) +
        rays(540, 500, {n: 18, color: P.goldLight, opacity: 0.18}) +
        confetti(41, 70, undefined, k * 45) +
        podium(540, 1500) +
        figureFront(JUDOKA({}), {x: 540, ground: 1210, size: 930, face: true, mood: 'smile', armR: {sh: 170 - (k % 2) * 8, el: (k % 2) * 10, medal: true}, armL: {sh: 18, el: 4}}) +
        figureFront(JUDOKA({hairStyle: 'side'}), {x: 240, ground: 1300, size: 860, face: true, mood: 'smile', armR: {sh: 157 + (k % 2) * 8, el: 10 - (k % 2) * 10, medal: true}, armL: {sh: 18, el: 4}}) +
        figureFront(JUDOKA({build: 1.08}), {x: 840, ground: 1360, size: 860, face: true, mood: 'smile', armL: {sh: 165 - (k % 2) * 8, el: (k % 2) * 10, medal: true}, armR: {sh: 18, el: 4}}) +
        rect(0, 1500, W, H, P.redDark),
      {bg: P.red},
    ),

  // Vitrine : trois médailles d'or, une place vide.
  '03b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#2a2233') +
        rect(80, 420, 920, 1000, P.wood, `stroke="${P.ink}" stroke-width="12" rx="20"`) +
        rect(130, 470, 820, 900, P.woodDark, `stroke="${P.ink}" stroke-width="8"`) +
        [[340, 700], [740, 700], [340, 1120], [740, 1120]]
          .map(([x, y], i) => rect(x - 170, y - 180, 340, 360, '#5a1424', `stroke="${P.ink}" stroke-width="8" rx="14"`) + (i < 3 ? medal(x, y + 30, 105) : ''))
          .join('') +
        spotlight(740, 0, 1320, 230, 0.4) +
        `<ellipse cx="740" cy="1150" rx="150" ry="60" fill="#fff6d8" opacity="0.3"/>` +
        rect(130, 470, 820, 900, '#cfe3ee', 'opacity="0.08"') +
        line(180, 520, 380, 900, '#ffffff', 10, 'opacity="0.18"'),
      {bg: '#2a2233'},
    ),

  // Une grande médaille d'or sur un coussin rouge.
  '04a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.night) +
        spotlight(540, 0, 1350, 520, 0.4) +
        particles(51, 540, 60, 1250, 420, 60, k * 0.03) +
        `<path d="M 170 1180 Q 540 1060 910 1180 Q 960 1280 900 1330 Q 540 1420 180 1330 Q 120 1280 170 1180 Z" fill="${P.red}" stroke="${P.ink}" stroke-width="10"/>` +
        circle(170, 1200, 22, P.gold) + circle(910, 1200, 22, P.gold) +
        medal(540, 900, 260),
      {bg: P.night},
    ),

  // Alignement de judokas de plus en plus grands, Geesink au bout.
  '04b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.paper) +
        rays(540, 300, {n: 16, color: P.red, opacity: 0.1}) +
        rect(0, 1380, W, H, P.tatami) +
        rect(0, 1380, W, 26, P.tatamiGreen) +
        figureFront(JUDOKA({height: 0.5, skin: P.skin, hair: '#7a4a26'}), {x: 95, ground: 1440, size: 1000, face: true}) +
        figureFront(JUDOKA({height: 0.58}), {x: 255, ground: 1440, size: 1000, face: true}) +
        figureFront(JUDOKA({height: 0.66, skin: '#b07a52', hairStyle: 'crop'}), {x: 440, ground: 1440, size: 1000, face: true}) +
        figureFront(JUDOKA({height: 0.74, build: 1.1, skin: P.skin, hair: '#c9a35a', hairStyle: 'side'}), {x: 650, ground: 1440, size: 1000, face: true}) +
        figureFront('geesink', {x: 900, ground: 1440, size: 1000, face: true}),
      {bg: P.paper},
    ),
});

function flagCrowd(yTop, yBottom, {seed = 61, n = 40, wave = 0} = {}) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = rand() * W;
    const y = yTop + rand() * (yBottom - yTop);
    const s = 0.6 + ((y - yTop) / (yBottom - yTop)) * 0.8;
    const ang = ((i + wave) % 2 ? 1 : -1) * 12;
    out += `<g transform="rotate(${ang} ${x.toFixed(1)} ${(y + 30 * s).toFixed(1)})">` + line(x, y + 30 * s, x, y - 20 * s, P.ink, 3 * s) + rect(x, y - 20 * s, 40 * s, 27 * s, P.ink) + flagJP(x + 1.5 * s, y - 18.5 * s, 37 * s, 24 * s) + '</g>';
  }
  return out;
}

// Geesink immobilise Kaminaga (vue de dessus, kesa-gatame), groupe centré sur (0, 0).
function pin(s = 1) {
  const k = figureFront('kaminaga', {x: 0, ground: 372, size: 1000, face: true, mood: 'fierce', armL: {sh: 40, el: 10}, armR: {sh: 130, el: 40}, legSpread: 14});
  const g = figureFront('geesink', {x: 0, ground: 465, size: 1000, face: true, mood: 'fierce', armL: {sh: 150, el: 50}, armR: {sh: 75, el: -40}, legSpread: 24, armsFront: true});
  return group(group(k, {rot: -90}) + group(g, {rot: -55, x: 120, y: 420}), {s});
}

function sweat(points, r = 16) {
  return points.map(([x, y]) => `<path d="M ${x} ${y} q ${-r * 0.7} ${r * 1.5} 0 ${r * 2} q ${r * 0.7} ${-r * 0.5} 0 ${-r * 2} Z" fill="#9fd8ec" stroke="${P.ink}" stroke-width="4"/>`).join('');
}

Object.assign(scenes, {
  // Kaminaga sort du tunnel sous les drapeaux.
  '05a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.gold) +
        rays(540, 820, {n: 22, color: P.white, opacity: 0.22}) +
        stands(60, 520, {seed: 63, rows: 5, scale: 1.2, bg: '#3a2a3a'}) +
        flagCrowd(60, 520, {seed: 64, n: 38, wave: k}) +
        `<path d="M 240 1500 L 240 880 Q 540 560 840 880 L 840 1500 Z" fill="${P.night}" stroke="${P.ink}" stroke-width="12"/>` +
        `<path d="M 290 1500 L 290 900 Q 540 640 790 900 L 790 1500 Z" fill="#0b0e1a"/>` +
        figureFront('kaminaga', {x: 540, ground: 1560, size: 1250, face: true, mood: 'fierce', armL: {sh: k ? 12 : 22, el: k ? 20 : 10}, armR: {sh: k ? 22 : 12, el: k ? 10 : 20}, legSpread: 8}) +
        rect(0, 1520, W, H, P.tatami) +
        rect(0, 1520, W, 24, P.tatamiGreen),
      {bg: P.gold},
    ),

  // Kaminaga serre sa ceinture.
  '05b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#3a2a3a') +
        blurred(crowd(60, 1300, {seed: 71, rows: 6, scale: 1.8}) + flagCrowd(60, 1100, {seed: 72, n: 30}), 7) +
        rect(0, 0, W, H, P.red, 'opacity="0.25"') +
        figureFront('kaminaga', {x: 540, ground: 2150, size: 2200, face: true, mood: 'fierce', armL: {sh: 8, el: -55}, armR: {sh: 8, el: -55}, legSpread: 6, armsFront: true}),
      {bg: '#3a2a3a'},
    ),

  // Geesink monte sur le tatami, contre-plongée.
  '06a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.night) +
        [[200, 140], [540, 90], [880, 140], [360, 260], [720, 260]].map(([x, y]) => circle(x, y, 160, 'url(#glow)') + circle(x, y, 34, '#fff6d8')).join('') +
        rays(540, 300, {n: 18, color: P.goldLight, opacity: 0.08}) +
        tatami(1500, 1920, {topW: 1400, bottomW: 2200}) +
        figureFront('geesink', {x: 540, ground: 1820, size: 1750, face: true, mood: 'neutral', legSpread: 13, armL: {sh: 20, el: 8}, armR: {sh: 20, el: 8}}),
      {bg: P.night},
    ),

  // Geesink sur une balance mécanique.
  '06c': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.paper) +
        rays(540, 500, {n: 16, color: P.gold, opacity: 0.15}) +
        // colonne + cadran
        rect(860, 640, 46, 820, P.greyLight, `stroke="${P.ink}" stroke-width="8"`) +
        circle(883, 560, 150, P.white, `stroke="${P.ink}" stroke-width="12"`) +
        Array.from({length: 13}, (_, i) => {
          const a = ((-120 + i * 20) * Math.PI) / 180;
          return line(883 + Math.sin(a) * 110, 560 - Math.cos(a) * 110, 883 + Math.sin(a) * 132, 560 - Math.cos(a) * 132, P.ink, i % 3 ? 4 : 8, 'stroke-linecap="butt"');
        }).join('') +
        `<path d="M 883 560 L ${883 + Math.sin(((118 + k * 10) * Math.PI) / 180) * 125} ${560 - Math.cos(((118 + k * 10) * Math.PI) / 180) * 125}" stroke="${P.red}" stroke-width="12" stroke-linecap="round"/>` +
        circle(883, 560, 16, P.ink) +
        // plateau qui plie
        `<path d="M 130 1420 Q 500 1500 900 1420 L 920 1480 Q 500 1560 110 1480 Z" fill="${P.grey}" stroke="${P.ink}" stroke-width="10"/>` +
        figureFront('geesink', {x: 500, ground: 1450, size: 1150, face: true, mood: 'smile'}) +
        line(70, 1500, 20, 1560, P.ink, 8) + line(960, 1500, 1010, 1560, P.ink, 8) + line(60, 1440, 0, 1450, P.ink, 8) + line(970, 1440, 1040, 1450, P.ink, 8) +
        sweat([[960, 330], [1010, 390]], 14) +
        rect(0, 1560, W, H, P.paperDark),
      {bg: P.paper},
    ),

  // Immobilisation vue de dessus.
  '07b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.tatami) +
        Array.from({length: 6}, (_, i) => line(0, 120 + i * 330, W, 120 + i * 330, P.tatamiLine, 6)).join('') +
        Array.from({length: 4}, (_, i) => line(180 + i * 360, 0, 180 + i * 360, H, P.tatamiLine, 6)).join('') +
        `<g transform="translate(530 760) rotate(-8)">${pin(1.05)}</g>` +
        sweat([[200, 760], [250, 690], [180, 900]], 18),
      {bg: P.tatami},
    ),

  // L'arbitre annonce ippon.
  '07c': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.red) +
        burst(560, 420, {n: 30, color: P.goldLight, r0: 30, r1: lerp(500, 1500, prog(k, n)), opacity: 0.55, seed: 77}) +
        circle(560, 420, 170, 'url(#glow)') +
        tatami(1100, 1700, {topW: 1300, bottomW: 1900}) +
        figureFront('referee', {x: 540, ground: 1180, size: 1150, face: true, mood: 'shout', armR: {sh: lerp(40, 178, easeIO(prog(k, n))), el: lerp(60, 0, prog(k, n))}, armL: {sh: 22, el: 6}}) +
        `<g transform="translate(500 1330) rotate(-4)">${pin(0.42)}</g>` +
        rect(0, 1700, W, H, P.tatamiGreen),
      {bg: P.red},
    ),
});

const OFFICIALS = ['officialA', 'officialB', 'officialC'];

function handkerchief(x, y, s = 1) {
  return `<path d="M ${x - 90 * s} ${y - 40 * s} Q ${x} ${y - 110 * s} ${x + 100 * s} ${y - 50 * s} L ${x + 60 * s} ${y + 90 * s} Q ${x - 10 * s} ${y + 60 * s} ${x - 70 * s} ${y + 100 * s} Z" fill="${P.white}" stroke="${P.ink}" stroke-width="${8 * s}" stroke-linejoin="round"/>`;
}

function shoe(x, y, s = 1) {
  // chaussure de ville vue de profil, pointe vers la droite ; (x, y) = talon au sol
  let out = `<path d="M ${x} ${y} L ${x} ${y - 150 * s} Q ${x + 40 * s} ${y - 190 * s} ${x + 150 * s} ${y - 175 * s} Q ${x + 260 * s} ${y - 150 * s} ${x + 380 * s} ${y - 90 * s} Q ${x + 470 * s} ${y - 50 * s} ${x + 460 * s} ${y} Z" fill="${P.ink}" stroke="${P.ink}" stroke-width="${6 * s}"/>`;
  out += rect(x - 10 * s, y - 10 * s, 480 * s, 34 * s, '#3a2a22', `rx="${10 * s}"`);
  out += `<path d="M ${x + 60 * s} ${y - 150 * s} Q ${x + 200 * s} ${y - 150 * s} ${x + 330 * s} ${y - 95 * s}" stroke="#ffffff" stroke-width="${14 * s}" fill="none" opacity="0.35" stroke-linecap="round"/>`;
  out += `<path d="M ${x + 150 * s} ${y - 172 * s} L ${x + 230 * s} ${y - 140 * s} M ${x + 170 * s} ${y - 160 * s} L ${x + 250 * s} ${y - 128 * s}" stroke="#55504a" stroke-width="${6 * s}"/>`;
  return out;
}

Object.assign(scenes, {
  // Les tribunes figées, lumière froide.
  '08a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#1c2236') +
        Array.from({length: 7}, (_, i) => line(-100 + i * 220, 0, 540, 420, '#2c3552', 18)).join('') +
        crowd(300, 1650, {seed: 81, rows: 10, scale: 2.1, density: 1.1, colors: ['#2a3350', '#3a4466', '#4c5677', '#232a40', '#5a6485']}) +
        rect(0, 0, W, H, '#6f8fc9', 'opacity="0.22"'),
      {bg: '#1c2236'},
    ),

  // Spectateurs en pleurs, une femme en kimono la main sur la bouche.
  '08b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#2a2233') +
        blurred(crowd(60, 900, {seed: 91, rows: 5, scale: 1.7, mood: 'sad'}), 7) +
        group(bust(SPECTATOR, {cx: 0, cy: 0, r: 230, mood: 'cry', ol: 9, tear: ((k + 2) % Math.max(1, n)) / Math.max(1, n)}), {x: 190, y: 620}) +
        group(bust({...SPECTATOR, hairStyle: 'crop', tie: '#2f4a6a'}, {cx: 0, cy: 0, r: 230, mood: 'cry', ol: 9, tear: ((k + 1) % Math.max(1, n)) / Math.max(1, n)}), {x: 900, y: 580}) +
        bust(KIMONO, {cx: 540, cy: 900, r: 330, mood: 'cry', tear: k / Math.max(1, n)}) +
        // main sur la bouche
        line(860, 1420, 610, 1110, P.ink, 120) +
        line(860, 1420, 610, 1110, '#962840', 100) +
        circle(590, 1075, 82, P.ink) +
        circle(590, 1075, 72, KIMONO.skin),
      {bg: '#2a2233'},
    ),

  // Un vieil homme s'essuie une larme avec un mouchoir.
  '08c': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#3b3346') +
        circle(540, 760, 560, '#4c4258') +
        bust(ELDER, {cx: 540, cy: 800, r: 380, mood: 'cry', tear: k / Math.max(1, n)}) +
        line(160, 1450, 340, 960, P.ink, 130) +
        line(160, 1450, 340, 960, '#2b2a33', 110) +
        circle(360, 900, 74, P.ink) +
        circle(360, 900, 64, ELDER.skin) +
        handkerchief(420, 830, 1.1),
      {bg: '#3b3346'},
    ),

  // Les officiels néerlandais bondissent de joie.
  '09a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.orange) +
        rays(540, 700, {n: 18, color: P.white, opacity: 0.18}) +
        rect(80, 1340, 920, 60, P.wood, `stroke="${P.ink}" stroke-width="8"`) +
        rect(130, 1400, 30, 160, P.woodDark) + rect(920, 1400, 30, 160, P.woodDark) +
        OFFICIALS.map((o, i) =>
          figureFront(o, {x: 230 + i * 310, ground: 1250 - (i === 1 ? 90 : 30) - ((k + i) % 3) * 35, size: 1000, face: true, mood: 'joy', armL: {sh: 150 + ((k + i) % 3) * 6, el: 15}, armR: {sh: 150 + ((k + i + 1) % 3) * 6, el: 15}, legSpread: 10 + ((k + i) % 3) * 4}) +
          line(200 + i * 310, 1290 - (i === 1 ? 60 : 0), 180 + i * 310, 1330, P.ink, 6) + line(260 + i * 310, 1290 - (i === 1 ? 60 : 0), 280 + i * 310, 1330, P.ink, 6),
        ).join('') +
        rect(0, 1560, W, H, '#c55f1f'),
      {bg: P.orange},
    ),

  // Les officiels courent vers le tatami.
  '09b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.paper) +
        rays(1000, 600, {n: 16, color: P.orange, opacity: 0.18}) +
        rect(0, 1250, W, H, '#cdbd94') +
        OFFICIALS.map((o, i) =>
          figure(o, {
            hip: [180 + i * 260 + k * 25, 900 + (i % 2) * 60 - ((k + i) % 2) * 20],
            size: 920,
            f: 1,
            lean: 18,
            face: true,
            mood: 'joy',
            arms: (k + i) % 2 ? [{sh: 70, el: 80}, {sh: -45, el: 70}] : [{sh: -45, el: 70}, {sh: 70, el: 80}],
            legs: (k + i) % 2 ? [{hip: 45, knee: 30}, {hip: -35, knee: 60}] : [{hip: -35, knee: 60}, {hip: 45, knee: 30}],
          }),
        ).join('') +
        `<g transform="translate(0 0)">` +
        poly([[-40, 1560], [1120, 1500], [1120, 1920], [-40, 1920]], P.tatamiGreen, `stroke="${P.ink}" stroke-width="8"`) +
        poly([[-40, 1600], [1120, 1540], [1120, 1920], [-40, 1920]], P.tatami) +
        `</g>`,
      {bg: P.paper},
    ),

  // La chaussure au bord du tatami sacré.
  '09c': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.night) +
        spotlight(560, 0, 1500, 480, 0.25) +
        rect(0, 1300, W, H, '#5a3b26') +
        Array.from({length: 6}, (_, i) => line(0, 1340 + i * 70, W, 1340 + i * 70, '#4a301e', 6)).join('') +
        poly([[640, 1240], [1100, 1240], [1100, 1920], [560, 1920]], P.tatamiGreen, `stroke="${P.ink}" stroke-width="8"`) +
        poly([[700, 1240], [1100, 1240], [1100, 1920], [630, 1920]], P.tatami) +
        `<ellipse cx="420" cy="1330" rx="280" ry="40" fill="#000" opacity="0.35"/>` +
        // jambe de pantalon + chaussette orange
        `<path d="M 170 -20 L 450 -20 L 420 ${960 - (1 - easeIO(prog(k, n))) * 150} L 190 ${960 - (1 - easeIO(prog(k, n))) * 150} Z" fill="#2b2a33" stroke="${P.ink}" stroke-width="10"/>` +
        rect(195, 950 - (1 - easeIO(prog(k, n))) * 150, 220, 110, P.orange, `stroke="${P.ink}" stroke-width="8"`) +
        group(shoe(0, 0, 1.15), {x: 170, y: lerp(1080, 1230, easeIO(prog(k, n))), rot: lerp(-16, -8, prog(k, n))}),
      {bg: P.night},
    ),
});

function globe(cx, cy, r, seed, spin = 0) {
  const rand = rng(seed);
  let out = circle(cx, cy, r + 10, P.ink) + circle(cx, cy, r, '#3f7fc0');
  const blobs = [[-0.45, -0.35, 0.32, 0.22], [-0.2, 0.25, 0.22, 0.35], [0.3, -0.3, 0.4, 0.2], [0.45, 0.2, 0.18, 0.3], [0.05, -0.65, 0.3, 0.1], [0.55, 0.62, 0.2, 0.1]];
  out += `<clipPath id="gclip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#gclip)">`;
  for (const [dx0, dy, rx, ry] of blobs) {
    const dx = ((dx0 + spin + 1.6) % 3.2) - 1.6;
    out += `<ellipse cx="${cx + dx * r}" cy="${cy + dy * r}" rx="${rx * r}" ry="${ry * r}" fill="#6aa65a" transform="rotate(${Math.round(rand() * 60 - 30)} ${cx + dx * r} ${cy + dy * r})"/>`;
  }
  out += `<path d="M ${cx - r} ${cy} Q ${cx} ${cy + r * 0.25} ${cx + r} ${cy}" stroke="#ffffff" stroke-width="5" fill="none" opacity="0.3"/></g>`;
  out += circle(cx - r * 0.35, cy - r * 0.4, r * 0.18, '#ffffff', 'opacity="0.18"');
  return out;
}

function nationFlags(y, n, seed) {
  const rand = rng(seed);
  const sets = [[P.red, P.white, P.blue], ['#3d8a5a', P.white, P.orange], [P.gold, P.ink, P.red], [P.blue, P.gold, P.blue], [P.red, P.gold, '#3d8a5a'], [P.white, P.red, P.white], ['#21468b', P.white, '#ae1c28']];
  let out = line(0, y - 10, W, y - 10, P.ink, 4);
  const w = W / n;
  for (let i = 0; i < n; i++) {
    const c = sets[Math.floor(rand() * sets.length)];
    const x = i * w + 10;
    const fw = w - 20;
    const vertical = rand() < 0.5;
    out += rect(x - 3, y - 3, fw + 6, 66, P.ink);
    for (let k = 0; k < 3; k++) out += vertical ? rect(x + (k * fw) / 3, y, fw / 3, 60, c[k]) : rect(x, y + k * 20, fw, 20, c[k]);
  }
  return out;
}

Object.assign(scenes, {
  // Geesink, à genoux, arrête les officiels d'un geste.
  '10a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.paper) +
        rays(540, 640, {n: 18, color: P.orange, opacity: 0.14}) +
        OFFICIALS.map((o, i) =>
          figure(o, {hip: [170 + i * 330, 860 - (i % 2) * 30], size: 520, f: i === 2 ? -1 : 1, lean: 14, face: true, mood: 'shout', arms: [{sh: -40, el: 60}, {sh: 70, el: 70}], legs: [{hip: -30, knee: 50}, {hip: 40, knee: 25}]}),
        ).join('') +
        rect(0, 1080, W, H, '#cdbd94') +
        figureFront('geesink', {x: 500, ground: 2000, size: 1250, face: true, mood: 'neutral', armL: {sh: 15, el: -40}, armR: {sh: 160, el: 0, palm: true}, armsFront: true}) +
        tatami(1380, 1920, {topW: 1600, bottomW: 2400}),
      {bg: P.paper},
    ),

  // Le salut entre les deux judokas.
  '10b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.gold) +
        rays(540, 700, {n: 20, color: P.goldLight, opacity: 0.4}) +
        sun(540, 700, 260, P.red) +
        tatami(1300, 1920, {topW: 1500, bottomW: 2300}) +
        figure('kaminaga', {hip: [230, 1180], size: 1000, f: 1, lean: lerp(0, 42, easeIO(prog(k, n))), headTilt: 10, face: true, arms: [{sh: 10, el: 5}, {sh: 0, el: 5}], legs: [{hip: -3, knee: 0}, {hip: 3, knee: 0}]}) +
        figure('geesink', {hip: [880, 1130], size: 1000, f: -1, lean: lerp(0, 40, easeIO(prog(k, n))), headTilt: 10, face: true, arms: [{sh: 10, el: 5}, {sh: 0, el: 5}], legs: [{hip: -3, knee: 0}, {hip: 3, knee: 0}]}),
      {bg: P.gold},
    ),

  // Poignée de main.
  '10c': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.red) +
        rays(540, 820, {n: 22, color: P.goldLight, opacity: 0.25}) +
        `<g transform="translate(0 ${k % 2 ? 28 : -10})">` +
        // manches
        line(-120, 1260, 420, 860, P.ink, 300) + line(-120, 1260, 420, 860, P.white, 276) +
        line(1200, 1180, 650, 860, P.ink, 250) + line(1200, 1180, 650, 860, P.white, 226) +
        // mains jointes
        `<path d="M 380 760 Q 560 700 720 780 Q 760 860 700 950 Q 540 1010 400 960 Q 330 860 380 760 Z" fill="${CHAR.geesink.skin}" stroke="${P.ink}" stroke-width="12"/>` +
        `<path d="M 560 760 Q 700 740 760 820 Q 760 900 690 930 Q 600 940 560 900" fill="${CHAR.kaminaga.skin}" stroke="${P.ink}" stroke-width="12"/>` +
        line(470, 800, 640, 800, P.ink, 8) + line(460, 860, 650, 860, P.ink, 8) + line(470, 915, 630, 915, P.ink, 8) +
        `<path d="M 420 760 Q 500 640 600 700" fill="${CHAR.geesink.skin}" stroke="${P.ink}" stroke-width="12"/>` +
        `</g>` +
        // ceintures noires
        rect(-40, 1500, 520, 70, P.ink, 'transform="rotate(-8 220 1535)"') + line(330, 1530, 380, 1700, P.ink, 40) +
        rect(620, 1470, 520, 70, P.ink, 'transform="rotate(6 880 1505)"') + line(760, 1520, 720, 1690, P.ink, 40) +
        rect(0, 1560, W, H, P.redDark, 'opacity="0.6"'),
      {bg: P.red},
    ),

  // Un globe, des judokas qui saluent sur tous les continents.
  '11a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, P.navy) +
        (() => {
          const r = rng(111);
          return Array.from({length: 70}, () => circle(r() * W, r() * 1400, 2 + r() * 4, '#fff6d8', 'opacity="0.6"')).join('');
        })() +
        `<path d="M 160 860 A 380 380 0 0 0 920 860" fill="none" stroke="${P.gold}" stroke-width="22"/>` +
        line(540, 1240, 540, 1420, P.woodDark, 40) +
        poly([[340, 1460], [740, 1460], [690, 1400], [390, 1400]], P.wood, `stroke="${P.ink}" stroke-width="8"`) +
        globe(540, 860, 360, 7, k * 0.08) +
        [-66, -33, 0, 33, 66].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const x = 540 + Math.sin(a) * 360;
          const y = 860 - Math.cos(a) * 360;
          const ch = {height: 0.8, build: 1, skin: [P.skin, P.skinJp, '#b07a52', '#8a5a3a'][i % 4], hair: [P.blond, P.black, P.black, '#7a4a26'][i % 4], hairStyle: 'crop', outfit: 'judogi'};
          return group(figure(ch, {hip: [0, -118], size: 290, f: i < 2 ? 1 : -1, lean: lerp(5, 45, prog(k, n)), hands: true, arms: [{sh: 5, el: 0}, {sh: 0, el: 0}], legs: [{hip: -3, knee: 0}, {hip: 3, knee: 0}]}), {x, y, rot: deg});
        }).join(''),
      {bg: P.navy},
    ),

  // Enfants du monde entier au dojo.
  '11b': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#d9b98a') +
        Array.from({length: 9}, (_, i) => line(i * 135, 0, i * 135, 1100, '#c4a274', 8)).join('') +
        nationFlags(220, 7, 3) +
        nationFlags(360, 6, 9) +
        rect(0, 1080, W, 40, P.woodDark) +
        tatami(1110, 1920, {topW: 1400, bottomW: 2200}) +
        [
          [140, 1430, P.skin, P.blond, 'smile'],
          [330, 1390, '#8a5a3a', P.black, 'joy'],
          [540, 1440, P.skinJp, P.black, 'smile'],
          [750, 1390, '#b07a52', '#3a2a1e', 'joy'],
          [940, 1430, P.skin, '#a0522d', 'smile'],
        ]
          .map(([x, g, skin, hair, mood], i) =>
            figureFront({height: 0.58, build: 1.05, skin, hair, hairStyle: i % 2 ? 'crop' : 'side', outfit: 'judogi'}, {x, ground: g, size: 1000, face: true, mood, armL: {sh: (i + k) % 2 ? 150 : 25, el: 10}, armR: {sh: (i + k) % 2 ? 25 : 150, el: 10}}),
          )
          .join(''),
      {bg: '#d9b98a'},
    ),

  // Geesink et Kaminaga, bras croisés : écran de fin.
  '12a': (k = 0, n = 1) =>
    svgDoc(
      rect(0, 0, W, H, '#1a0f12') +
        `<radialGradient id="redglow" cx="50%" cy="70%" r="60%"><stop offset="0%" stop-color="${P.red}" stop-opacity="0.85"/><stop offset="100%" stop-color="${P.red}" stop-opacity="0"/></radialGradient>` +
        rect(0, 600, W, 1320, 'url(#redglow)') +
        line(0, 640, W, 640, P.gold, 6, 'opacity="0.6"') +
        rect(0, 1520, W, H, P.tatami) +
        rect(0, 1520, W, 24, P.tatamiGreen) +
        figureFront('kaminaga', {x: 330, ground: 1580, size: 1050, face: true, mood: 'fierce', crossed: true}) +
        figureFront('geesink', {x: 750, ground: 1580, size: 1050, face: true, mood: 'neutral', crossed: true}),
      {bg: '#1a0f12'},
    ),
});
