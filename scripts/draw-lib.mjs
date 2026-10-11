// Petite bibliothèque SVG pour dessiner des plans "affiche Tokyo 1964" sans IA :
// aplats de couleur, personnages pictogrammes articulés (inspirés des pictogrammes des JO de 1964),
// décors simples et grain de papier. Toutes les fonctions renvoient des chaînes SVG.
// Repère : viewBox 0 0 1080 1920 (format vertical 9:16).

export const W = 1080;
export const H = 1920;

export const P = {
  paper: '#efe3c8',
  paperDark: '#e2d2b0',
  red: '#c8102e',
  redDark: '#9e0c24',
  ink: '#1a1714',
  gold: '#d4a640',
  goldLight: '#f0cd6e',
  navy: '#1f2b4a',
  night: '#141a2e',
  orange: '#e8742a',
  white: '#fbf8f1',
  whiteShade: '#e4ddcf',
  tatami: '#c9b77a',
  tatamiGreen: '#8fa060',
  tatamiLine: '#a8955a',
  skin: '#f0c9a0',
  skinShade: '#ddb088',
  skinJp: '#e8bd8f',
  blond: '#f2c84b',
  black: '#1a1714',
  grey: '#6f6a63',
  greyLight: '#a8a29a',
  blue: '#2a5aa8',
  wood: '#a86b3c',
  woodDark: '#7d4c28',
  sky: '#f4a259',
};

const r1 = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;

// ---------- Document ----------
export function svgDoc(body, {bg = P.paper, grain = 0.22} = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 ${grain} 0"/>
  </filter>
  <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
    <stop offset="60%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.28"/>
  </radialGradient>
  <radialGradient id="spot" cx="50%" cy="0%" r="100%">
    <stop offset="0%" stop-color="#fff6d8" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#fff6d8" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#fff3c4" stop-opacity="1"/>
    <stop offset="100%" stop-color="#fff3c4" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="${bg}"/>
${body}
<rect width="${W}" height="${H}" fill="url(#vignette)"/>
<rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;
}

export const rect = (x, y, w, h, fill, extra = '') => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}" ${extra}/>`;
export const circle = (cx, cy, r, fill, extra = '') => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${fill}" ${extra}/>`;
export const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((p) => p.map(r1).join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
export const line = (x1, y1, x2, y2, stroke, w, extra = '') =>
  `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${stroke}" stroke-width="${r1(w)}" stroke-linecap="round" ${extra}/>`;
export const group = (body, {x = 0, y = 0, s = 1, rot = 0, flip = false, opacity = 1} = {}) =>
  `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${rot}) scale(${flip ? -s : s} ${s})" opacity="${opacity}">${body}</g>`;

// Seeded random so scenes are reproducible.
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------- Backgrounds ----------
export function sun(cx, cy, r, fill = P.red) {
  return circle(cx, cy, r, fill);
}

export function rays(cx, cy, {n = 16, color = P.red, opacity = 0.18, len = 2600} = {}) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI;
    const a1 = a0 + Math.PI / n;
    out += poly(
      [
        [cx, cy],
        [cx + Math.cos(a0) * len, cy + Math.sin(a0) * len],
        [cx + Math.cos(a1) * len, cy + Math.sin(a1) * len],
      ],
      color,
      `opacity="${opacity}"`,
    );
  }
  return out;
}

export function burst(cx, cy, {n = 22, color = P.goldLight, r0 = 60, r1: rr = 900, opacity = 0.9, seed = 3} = {}) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI + rand() * 0.1;
    const w = 0.05 + rand() * 0.06;
    const len = rr * (0.6 + rand() * 0.5);
    out += poly(
      [
        [cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0],
        [cx + Math.cos(a) * len, cy + Math.sin(a) * len],
        [cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0],
      ],
      color,
      `opacity="${opacity}"`,
    );
  }
  return out;
}

export function spotlight(cx, topY, bottomY, halfWidth, opacity = 0.55) {
  return poly(
    [
      [cx - 40, topY],
      [cx + 40, topY],
      [cx + halfWidth, bottomY],
      [cx - halfWidth, bottomY],
    ],
    '#fff6d8',
    `opacity="${opacity}"`,
  );
}

// Tatami mat seen in perspective (trapezoid with grid).
export function tatami(yTop, yBottom, {topW = 760, bottomW = 1500, cx = W / 2, color = P.tatami, line: lc = P.tatamiLine, rows = 4, cols = 6, border = P.tatamiGreen} = {}) {
  const tl = [cx - topW / 2, yTop];
  const tr = [cx + topW / 2, yTop];
  const br = [cx + bottomW / 2, yBottom];
  const bl = [cx - bottomW / 2, yBottom];
  let out = poly([tl, tr, br, bl], border);
  const inset = 0.08;
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const itl = lerp(tl, br, inset * 0.6);
  const itr = lerp(tr, bl, inset * 0.6);
  const ibr = lerp(br, tl, inset * 0.6);
  const ibl = lerp(bl, tr, inset * 0.6);
  out += poly([itl, itr, ibr, ibl], color);
  for (let i = 1; i < rows; i++) {
    const t = i / rows;
    const a = lerp(itl, ibl, t);
    const b = lerp(itr, ibr, t);
    out += line(a[0], a[1], b[0], b[1], lc, 3);
  }
  for (let j = 1; j < cols; j++) {
    const t = j / cols;
    const a = lerp(itl, itr, t);
    const b = lerp(ibl, ibr, t);
    out += line(a[0], a[1], b[0], b[1], lc, 3);
  }
  return out;
}

// Rows of tiny spectator heads/bodies (crowd), from yTop to yBottom.
export function crowd(yTop, yBottom, {seed = 5, rows = 7, density = 1, scale = 1, colors, mood = 'calm', x0 = -40, x1 = W + 40} = {}) {
  const rand = rng(seed);
  const cols = colors || [P.ink, P.navy, P.grey, '#4a3b2e', P.red, '#3d4f3a', P.greyLight];
  let out = '';
  for (let r = 0; r < rows; r++) {
    const t = rows === 1 ? 1 : r / (rows - 1);
    const y = yTop + (yBottom - yTop) * t;
    const s = (0.55 + 0.6 * t) * scale;
    const step = 46 * s / density;
    for (let x = x0 + (r % 2) * step * 0.5; x < x1; x += step * (0.85 + rand() * 0.3)) {
      const body = cols[Math.floor(rand() * cols.length)];
      const hair = rand() < 0.85 ? P.ink : P.greyLight;
      out += `<path d="M ${r1(x - 20 * s)} ${r1(y + 40 * s)} Q ${r1(x)} ${r1(y - 4 * s)} ${r1(x + 20 * s)} ${r1(y + 40 * s)} Z" fill="${body}"/>`;
      out += circle(x, y - 6 * s, 13 * s, P.skinJp);
      out += `<path d="M ${r1(x - 13 * s)} ${r1(y - 6 * s)} A ${r1(13 * s)} ${r1(13 * s)} 0 0 1 ${r1(x + 13 * s)} ${r1(y - 6 * s)} Z" fill="${hair}"/>`;
      if (mood === 'cheer' && rand() < 0.35) {
        out += line(x - 14 * s, y + 10 * s, x - 22 * s, y - 26 * s, body, 7 * s);
      }
      if (mood === 'sad' && rand() < 0.3) {
        out += circle(x + 5 * s, y + 2 * s, 2.6 * s, '#7ec8e3');
      }
    }
  }
  return out;
}

export function flagNL(x, y, w, h) {
  return rect(x, y, w, h / 3, '#ae1c28') + rect(x, y + h / 3, w, h / 3, P.white) + rect(x, y + (2 * h) / 3, w, h / 3, '#21468b');
}
export function flagJP(x, y, w, h) {
  return rect(x, y, w, h, P.white) + circle(x + w / 2, y + h / 2, h * 0.3, P.red);
}

// ---------- Figures (pictogrammes articulés) ----------
// Angles en degrés mesurés depuis la verticale "haut", positifs vers l'avant du personnage.
//  lean : inclinaison du buste (0 = droit, 90 = couché vers l'avant)
//  arms : [{sh, el}] (sh : 0 = bras le long du corps, 90 = tendu devant, 180 = levé ; el : flexion du coude)
//  legs : [{hip, knee}] (hip : 0 = vertical, + = jambe vers l'avant ; knee : flexion, le tibia part vers l'arrière)
// Le premier bras/jambe est le côté éloigné (dessiné en premier, plus sombre).
export const CHAR = {
  geesink: {height: 1, build: 1.18, skin: P.skin, hair: P.blond, hairStyle: 'slick', outfit: 'judogi', patch: 'nl'},
  kaminaga: {height: 0.8, build: 1.08, skin: P.skinJp, hair: P.black, hairStyle: 'crop', outfit: 'judogi', patch: 'jp'},
  referee: {height: 0.78, build: 0.95, skin: P.skinJp, hair: P.black, hairStyle: 'side', outfit: 'blazer'},
  officialA: {height: 0.8, build: 1.05, skin: P.skin, hair: null, hairStyle: 'bald', outfit: 'suit', glasses: true},
  officialB: {height: 0.8, build: 1.0, skin: P.skin, hair: P.greyLight, hairStyle: 'side', outfit: 'suit', moustache: true},
  officialC: {height: 0.82, build: 0.95, skin: P.skin, hair: '#7a4a26', hairStyle: 'side', outfit: 'suit'},
  judokaJp: {height: 0.78, build: 1.0, skin: P.skinJp, hair: P.black, hairStyle: 'crop', outfit: 'judogi', patch: 'jp'},
  spectator: {height: 0.78, build: 1.0, skin: P.skinJp, hair: P.black, hairStyle: 'side', outfit: 'suit'},
};

const OUTFITS = {
  judogi: {top: P.white, topShade: P.whiteShade, legs: P.white, legsShade: P.whiteShade, feet: 'skin', belt: P.black},
  suit: {top: '#2b2a33', topShade: '#1f1e26', legs: '#2b2a33', legsShade: '#1f1e26', feet: P.ink, tie: P.orange, shirt: P.white},
  kimono: {top: '#b8324a', topShade: '#962840', legs: '#b8324a', legsShade: '#962840', feet: P.white, obi: P.gold},
  blazer: {top: P.navy, topShade: '#172038', legs: '#77736c', legsShade: '#5f5b55', feet: P.ink, tie: '#2b2a33', shirt: P.white},
};

function vec(theta, f) {
  return [f * Math.sin(rad(theta)), -Math.cos(rad(theta))];
}
function add(p, v, len) {
  return [p[0] + v[0] * len, p[1] + v[1] * len];
}
function limb(a, b, color, w, ol) {
  return line(a[0], a[1], b[0], b[1], P.ink, w + ol * 2) + line(a[0], a[1], b[0], b[1], color, w);
}
function seg(pts, color, w, ol) {
  const d = 'M ' + pts.map((p) => p.map(r1).join(' ')).join(' L ');
  return (
    `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="${r1(w + ol * 2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

export function head(c, r, ch, {f = 1, face = false, mood = 'neutral', front = false, ol = 4} = {}) {
  let out = circle(c[0], c[1], r + ol, P.ink) + circle(c[0], c[1], r, ch.skin);
  const hr = r;
  if (ch.hairStyle === 'slick' && ch.hair) {
    // swept back blond hair: cap covering top and back
    out += front
      ? `<path d="M ${r1(c[0] - hr)} ${r1(c[1] - hr * 0.05)} Q ${r1(c[0] - hr * 1.05)} ${r1(c[1] - hr * 1.25)} ${r1(c[0])} ${r1(c[1] - hr * 1.12)} Q ${r1(c[0] + hr * 1.05)} ${r1(c[1] - hr * 1.25)} ${r1(c[0] + hr)} ${r1(c[1] - hr * 0.05)} Q ${r1(c[0] + hr * 0.6)} ${r1(c[1] - hr * 0.62)} ${r1(c[0])} ${r1(c[1] - hr * 0.6)} Q ${r1(c[0] - hr * 0.6)} ${r1(c[1] - hr * 0.62)} ${r1(c[0] - hr)} ${r1(c[1] - hr * 0.05)} Z" fill="${ch.hair}" stroke="${P.ink}" stroke-width="${ol * 0.8}"/>`
      : `<path d="M ${r1(c[0] + f * hr * 0.55)} ${r1(c[1] - hr * 0.85)} Q ${r1(c[0] - f * hr * 0.2)} ${r1(c[1] - hr * 1.3)} ${r1(c[0] - f * hr * 1.08)} ${r1(c[1] - hr * 0.3)} Q ${r1(c[0] - f * hr * 1.0)} ${r1(c[1] + hr * 0.25)} ${r1(c[0] - f * hr * 0.7)} ${r1(c[1] + hr * 0.4)} Q ${r1(c[0] - f * hr * 0.3)} ${r1(c[1] - hr * 0.35)} ${r1(c[0] + f * hr * 0.75)} ${r1(c[1] - hr * 0.55)} Z" fill="${ch.hair}" stroke="${P.ink}" stroke-width="${ol * 0.8}"/>`;
  } else if (ch.hairStyle === 'crop' && ch.hair) {
    out += `<path d="M ${r1(c[0] - hr * 1.02)} ${r1(c[1] - hr * 0.1)} A ${r1(hr * 1.02)} ${r1(hr * 1.02)} 0 0 1 ${r1(c[0] + hr * 1.02)} ${r1(c[1] - hr * 0.1)} Q ${r1(c[0])} ${r1(c[1] - hr * 0.55)} ${r1(c[0] - hr * 1.02)} ${r1(c[1] - hr * 0.1)} Z" fill="${ch.hair}"/>`;
  } else if (ch.hairStyle === 'side' && ch.hair) {
    out += `<path d="M ${r1(c[0] - hr * 1.02)} ${r1(c[1] + hr * 0.05)} A ${r1(hr * 1.02)} ${r1(hr * 1.02)} 0 0 1 ${r1(c[0] + hr * 1.02)} ${r1(c[1] + hr * 0.05)} Q ${r1(c[0] + hr * 0.2)} ${r1(c[1] - hr * 0.75)} ${r1(c[0] - hr * 1.02)} ${r1(c[1] + hr * 0.05)} Z" fill="${ch.hair}"/>`;
  } else if (ch.hairStyle === 'bun' && ch.hair) {
    out += circle(c[0], c[1] - hr * 1.05, hr * 0.42, ch.hair);
    out += `<path d="M ${r1(c[0] - hr * 1.04)} ${r1(c[1] + hr * 0.2)} A ${r1(hr * 1.04)} ${r1(hr * 1.04)} 0 0 1 ${r1(c[0] + hr * 1.04)} ${r1(c[1] + hr * 0.2)} Q ${r1(c[0])} ${r1(c[1] - hr * 0.6)} ${r1(c[0] - hr * 1.04)} ${r1(c[1] + hr * 0.2)} Z" fill="${ch.hair}"/>`;
  } else if (ch.hairStyle === 'bald') {
    out += `<path d="M ${r1(c[0] - hr * 1.0)} ${r1(c[1] + hr * 0.1)} Q ${r1(c[0] - hr * 1.05)} ${r1(c[1] - hr * 0.35)} ${r1(c[0] - hr * 0.8)} ${r1(c[1] - hr * 0.3)} L ${r1(c[0] - hr * 0.7)} ${r1(c[1] + hr * 0.1)} Z" fill="${P.greyLight}"/>`;
  }
  if (face) {
    const ey = c[1] + hr * 0.05;
    const eyes = front ? [c[0] - hr * 0.36, c[0] + hr * 0.36] : [c[0] + f * hr * 0.45];
    for (const ex of eyes) {
      out += circle(ex, ey, hr * 0.085, P.ink);
      const browY = ey - hr * 0.24;
      const tilt = mood === 'fierce' ? hr * 0.08 : mood === 'sad' || mood === 'cry' ? -hr * 0.08 : 0;
      const inner = front ? (ex < c[0] ? 1 : -1) : -f;
      if (tilt) out += line(ex - inner * hr * 0.16, browY - tilt, ex + inner * hr * 0.16, browY + tilt, P.ink, hr * 0.08);
      else out += line(ex - hr * 0.16, browY, ex + hr * 0.16, browY, P.ink, hr * 0.07);
    }
    if (mood === 'cry') {
      for (const ex of eyes) {
        out += `<path d="M ${r1(ex)} ${r1(ey + hr * 0.15)} q ${r1(-hr * 0.09)} ${r1(hr * 0.22)} 0 ${r1(hr * 0.3)} q ${r1(hr * 0.09)} ${r1(-hr * 0.08)} 0 ${r1(-hr * 0.3)} Z" fill="#7ec8e3" stroke="${P.ink}" stroke-width="${r1(hr * 0.025)}"/>`;
        out += `<path d="M ${r1(ex)} ${r1(ey + hr * 0.55)} q ${r1(-hr * 0.07)} ${r1(hr * 0.17)} 0 ${r1(hr * 0.23)} q ${r1(hr * 0.07)} ${r1(-hr * 0.06)} 0 ${r1(-hr * 0.23)} Z" fill="#7ec8e3" stroke="${P.ink}" stroke-width="${r1(hr * 0.025)}"/>`;
      }
    }
    const mx = front ? c[0] : c[0] + f * hr * 0.42;
    const my = c[1] + hr * 0.5;
    if (mood === 'shout' || mood === 'joy') out += `<ellipse cx="${r1(mx)}" cy="${r1(my)}" rx="${r1(hr * 0.16)}" ry="${r1(hr * 0.2)}" fill="${P.ink}"/>`;
    else if (mood === 'sad' || mood === 'cry') out += `<path d="M ${r1(mx - hr * 0.16)} ${r1(my + hr * 0.06)} Q ${r1(mx)} ${r1(my - hr * 0.1)} ${r1(mx + hr * 0.16)} ${r1(my + hr * 0.06)}" fill="none" stroke="${P.ink}" stroke-width="${r1(hr * 0.06)}" stroke-linecap="round"/>`;
    else if (mood === 'smile') out += `<path d="M ${r1(mx - hr * 0.16)} ${r1(my - hr * 0.04)} Q ${r1(mx)} ${r1(my + hr * 0.12)} ${r1(mx + hr * 0.16)} ${r1(my - hr * 0.04)}" fill="none" stroke="${P.ink}" stroke-width="${r1(hr * 0.06)}" stroke-linecap="round"/>`;
    else out += line(mx - hr * 0.13, my, mx + hr * 0.13, my, P.ink, hr * 0.06);
    if (ch.glasses) {
      for (const ex of eyes) out += circle(ex, ey, hr * 0.2, 'none', `stroke="${P.ink}" stroke-width="${r1(hr * 0.05)}"`);
    }
    if (ch.moustache) out += `<path d="M ${r1(mx - hr * 0.22)} ${r1(my - hr * 0.1)} Q ${r1(mx)} ${r1(my - hr * 0.25)} ${r1(mx + hr * 0.22)} ${r1(my - hr * 0.1)} Z" fill="${P.greyLight}" stroke="${P.ink}" stroke-width="${r1(hr * 0.03)}"/>`;
  }
  return out;
}

// Side view figure. hip = [x, y] absolute; size = height in px of a "height 1" character.
export function figure(name, {hip, size = 900, f = 1, lean = 0, headTilt = 0, arms, legs, face = false, mood = 'neutral', hands = true} = {}) {
  const ch = typeof name === 'string' ? CHAR[name] : name;
  const o = OUTFITS[ch.outfit];
  const Hh = size * ch.height;
  const wLimb = Hh * 0.075 * ch.build;
  const wTorso = Hh * 0.16 * ch.build;
  const ol = Math.max(3, Hh * 0.006);
  const L = {torso: Hh * 0.29, ua: Hh * 0.165, fa: Hh * 0.15, th: Hh * 0.235, sh: Hh * 0.235, neck: Hh * 0.09, head: Hh * 0.075};
  arms = arms || [{sh: 8, el: 10}, {sh: -6, el: 12}];
  legs = legs || [{hip: -6, knee: 4}, {hip: 6, knee: 2}];
  const up = vec(lean, f);
  const shoulder = add(hip, up, L.torso);
  const shades = [o.topShade, o.top];
  const legShades = [o.legsShade, o.legs];

  const drawArm = (a, i) => {
    const tua = lean + 180 - a.sh;
    const tfa = tua - a.el;
    const s0 = add(shoulder, vec(lean + 180, f), wTorso * 0.12);
    const e = add(s0, vec(tua, f), L.ua);
    const h = add(e, vec(tfa, f), L.fa);
    let out = seg([s0, e, h], shades[i], wLimb, ol);
    if (hands) out += circle(h[0], h[1], wLimb * 0.52 + ol, P.ink) + circle(h[0], h[1], wLimb * 0.52, ch.skin);
    return out;
  };
  const drawLeg = (l, i) => {
    const tth = 180 - l.hip;
    const tsh = tth + l.knee;
    const k = add(hip, vec(tth, f), L.th);
    const a = add(k, vec(tsh, f), L.sh);
    let out = seg([hip, k, a], legShades[i], wLimb * 1.15, ol);
    const footDir = vec(tsh - 90, f);
    const toe = add(a, footDir, wLimb * 1.1);
    const footColor = o.feet === 'skin' ? ch.skin : o.feet;
    out += limb(a, toe, footColor, wLimb * 0.7, ol);
    return out;
  };

  let out = '';
  out += drawLeg(legs[0], 0);
  out += drawArm(arms[0], 0);
  // torso
  const tTop = add(shoulder, vec(lean + 180, f), wTorso * 0.12);
  out += line(hip[0], hip[1], tTop[0], tTop[1], P.ink, wTorso + ol * 2) + line(hip[0], hip[1], tTop[0], tTop[1], o.top, wTorso);
  if (ch.outfit === 'judogi') {
    // lapel
    const lapA = add(tTop, vec(lean + 90, f), wTorso * 0.38);
    const lapB = add(hip, vec(lean + 90, f), wTorso * 0.05);
    const lapB2 = add(lapB, up, L.torso * 0.25);
    out += `<path d="M ${r1(lapA[0])} ${r1(lapA[1])} L ${r1(lapB2[0])} ${r1(lapB2[1])}" stroke="${P.ink}" stroke-width="${r1(ol * 1.1)}" fill="none" stroke-linecap="round"/>`;
    // patch
    if (ch.patch) {
      const pc = add(add(tTop, vec(lean + 180, f), L.torso * 0.28), vec(lean + 90, f), wTorso * 0.22);
      const pw = wTorso * 0.3;
      const ph = pw * 0.68;
      out += `<g transform="translate(${r1(pc[0] - pw / 2)} ${r1(pc[1] - ph / 2)})">${rect(-ol * 0.6, -ol * 0.6, pw + ol * 1.2, ph + ol * 1.2, P.ink)}${ch.patch === 'nl' ? flagNL(0, 0, pw, ph) : flagJP(0, 0, pw, ph)}</g>`;
    }
    // belt
    const b1 = add(hip, up, L.torso * 0.1);
    const bl = add(b1, vec(lean + 90, f), wTorso * 0.55);
    const br = add(b1, vec(lean - 90, f), wTorso * 0.55);
    out += line(bl[0], bl[1], br[0], br[1], o.belt, wLimb * 0.45, 'stroke-linecap="butt"');
    const knot = add(bl, vec(lean + 180, f), wLimb * 0.5);
    out += line(bl[0], bl[1], knot[0] + f * wLimb * 0.2, knot[1], o.belt, wLimb * 0.22);
  } else {
    const nTop = add(tTop, vec(lean + 180, f), wTorso * 0.05);
    const front1 = add(nTop, vec(lean + 90, f), wTorso * 0.4);
    const tieEnd = add(front1, vec(lean + 180, f), L.torso * 0.55);
    out += line(front1[0], front1[1], tieEnd[0], tieEnd[1], o.shirt, wTorso * 0.16);
    out += line(front1[0], front1[1], tieEnd[0], tieEnd[1], o.tie, wTorso * 0.09);
  }
  // head
  const hc = add(shoulder, vec(lean + headTilt, f), L.neck);
  out += head(hc, L.head, ch, {f, face, mood, ol});
  out += drawLeg(legs[1], 1);
  out += drawArm(arms[1], 1);
  return out;
}

// Front view figure standing; feet at [x, groundY].
export function figureFront(name, {x, ground, size = 900, armL = {sh: 16, el: 4}, armR = {sh: 16, el: 4}, legSpread = 6, face = false, mood = 'neutral', crossed = false, armsFront = false} = {}) {
  const ch = typeof name === 'string' ? CHAR[name] : name;
  const o = OUTFITS[ch.outfit];
  const Hh = size * ch.height;
  const wLimb = Hh * 0.08 * ch.build;
  const shW = Hh * 0.23 * ch.build;
  const hipW = Hh * 0.15 * ch.build;
  const ol = Math.max(3, Hh * 0.006);
  const L = {torso: Hh * 0.3, ua: Hh * 0.165, fa: Hh * 0.15, leg: Hh * 0.47, neck: Hh * 0.085, head: Hh * 0.075};
  const hipY = ground - L.leg;
  const shY = hipY - L.torso;
  let out = '';
  // legs
  for (const side of [-1, 1]) {
    const hx = x + side * hipW * 0.32;
    const fx = hx + side * Math.sin(rad(legSpread)) * L.leg;
    out += seg([[hx, hipY], [fx, ground - wLimb * 0.4]], o.legs, wLimb * 1.2, ol);
    const footColor = o.feet === 'skin' ? ch.skin : o.feet;
    out += `<ellipse cx="${r1(fx + side * wLimb * 0.2)}" cy="${r1(ground)}" rx="${r1(wLimb * 0.75)}" ry="${r1(wLimb * 0.38)}" fill="${footColor}" stroke="${P.ink}" stroke-width="${r1(ol)}"/>`;
  }
  // torso (trapezoid)
  const torso = [
    [x - shW / 2, shY],
    [x + shW / 2, shY],
    [x + hipW / 2 + wLimb * 0.15, hipY + wLimb * 0.3],
    [x - hipW / 2 - wLimb * 0.15, hipY + wLimb * 0.3],
  ];
  const drawArms = () => {
    let a = '';
    for (const [side, arm] of [[-1, armL], [1, armR]]) {
      const s0 = [x + (side * shW) / 2 - side * wLimb * 0.35, shY + wLimb * 0.5];
      const tua = 180 - arm.sh;
      const e = add(s0, vec(tua, side), L.ua);
      const h = add(e, vec(tua - arm.el, side), L.fa);
      a += seg([s0, e, h], o.top, wLimb, ol);
      if (arm.palm) {
        const pr = wLimb * 0.85;
        for (let k = -2; k <= 2; k++) {
          const fa = (k * 16 * Math.PI) / 180;
          const fl = pr * (k === -2 ? 1.2 : 1.6);
          a += limb([h[0], h[1] - pr * 0.2], [h[0] + Math.sin(fa) * fl, h[1] - pr * 0.2 - Math.cos(fa) * fl], ch.skin, pr * 0.42, ol);
        }
        a += circle(h[0], h[1], pr + ol, P.ink) + circle(h[0], h[1], pr, ch.skin);
      } else {
        a += circle(h[0], h[1], wLimb * 0.5 + ol, P.ink) + circle(h[0], h[1], wLimb * 0.5, ch.skin);
      }
      if (arm.medal) a += medal(h[0], h[1] - wLimb * 1.1, wLimb * 1.1, {ribbon: false});
    }
    return a;
  };
  if (!crossed && !armsFront) out += drawArms();
  const [t0, t1, t2, t3] = torso;
  const cr = wLimb * 0.7;
  out += `<path d="M ${r1(t0[0])} ${r1(t0[1] + cr)} Q ${r1(t0[0])} ${r1(t0[1])} ${r1(t0[0] + cr)} ${r1(t0[1])} L ${r1(t1[0] - cr)} ${r1(t1[1])} Q ${r1(t1[0])} ${r1(t1[1])} ${r1(t1[0])} ${r1(t1[1] + cr)} L ${r1(t2[0])} ${r1(t2[1])} L ${r1(t3[0])} ${r1(t3[1])} Z" fill="${o.top}" stroke="${P.ink}" stroke-width="${r1(ol * 2)}" stroke-linejoin="round"/>`;
  if (ch.outfit === 'kimono') {
    out += `<path d="M ${r1(x - shW * 0.3)} ${r1(shY + 2)} L ${r1(x + shW * 0.12)} ${r1(shY + L.torso * 0.6)} M ${r1(x + shW * 0.3)} ${r1(shY + 2)} L ${r1(x)} ${r1(shY + L.torso * 0.45)}" stroke="${P.white}" stroke-width="${r1(ol * 3)}" fill="none"/>`;
    out += rect(x - shW * 0.45, shY + L.torso * 0.6, shW * 0.9, L.torso * 0.25, o.obi, `stroke="${P.ink}" stroke-width="${r1(ol)}"`);
  } else if (ch.outfit === 'judogi') {
    out += `<path d="M ${r1(x - shW * 0.28)} ${r1(shY + 2)} L ${r1(x + shW * 0.08)} ${r1(shY + L.torso * 0.55)} M ${r1(x + shW * 0.28)} ${r1(shY + 2)} L ${r1(x - shW * 0.02)} ${r1(shY + L.torso * 0.45)}" stroke="${P.ink}" stroke-width="${r1(ol * 1.1)}" fill="none" stroke-linecap="round"/>`;
    const by = hipY - L.torso * 0.05;
    out += rect(x - hipW / 2 - wLimb * 0.25, by - wLimb * 0.22, hipW + wLimb * 0.5, wLimb * 0.44, o.belt);
    out += line(x - wLimb * 0.3, by, x - wLimb * 0.6, by + wLimb * 1.1, o.belt, wLimb * 0.24) + line(x + wLimb * 0.2, by, x + wLimb * 0.45, by + wLimb * 1.1, o.belt, wLimb * 0.24);
    if (ch.patch) {
      const pw = shW * 0.2;
      const ph = pw * 0.68;
      const px = x + shW * 0.12;
      const py = shY + L.torso * 0.2;
      out += rect(px - ol * 0.6, py - ol * 0.6, pw + ol * 1.2, ph + ol * 1.2, P.ink) + (ch.patch === 'nl' ? flagNL(px, py, pw, ph) : flagJP(px, py, pw, ph));
    }
  } else {
    out += poly([[x - shW * 0.14, shY], [x + shW * 0.14, shY], [x, shY + L.torso * 0.42]], o.shirt);
    out += poly([[x - shW * 0.04, shY + 4], [x + shW * 0.04, shY + 4], [x + shW * 0.05, shY + L.torso * 0.6], [x, shY + L.torso * 0.68], [x - shW * 0.05, shY + L.torso * 0.6]], o.tie);
  }
  if (crossed) {
    // arms crossed over chest
    const cy = shY + L.torso * 0.42;
    out += seg([[x - shW * 0.42, shY + wLimb * 0.6], [x - shW * 0.45, cy], [x + shW * 0.25, cy - wLimb * 0.3]], o.topShade || o.top, wLimb, ol);
    out += seg([[x + shW * 0.42, shY + wLimb * 0.6], [x + shW * 0.45, cy + wLimb * 0.4], [x - shW * 0.25, cy + wLimb * 0.2]], o.top, wLimb, ol);
  }
  if (armsFront) out += drawArms();
  const hc = [x, shY - L.neck];
  out += head(hc, L.head, ch, {front: true, face, mood, ol});
  return out;
}

export function medal(cx, cy, r, {ribbon = true, ribbonColor = P.red} = {}) {
  let out = '';
  if (ribbon) {
    out += poly([[cx - r * 0.55, cy - r * 2.4], [cx - r * 0.05, cy - r * 2.4], [cx + r * 0.35, cy - r * 0.6], [cx - r * 0.15, cy - r * 0.6]], ribbonColor, `stroke="${P.ink}" stroke-width="${r1(r * 0.05)}"`);
    out += poly([[cx + r * 0.55, cy - r * 2.4], [cx + r * 0.05, cy - r * 2.4], [cx - r * 0.35, cy - r * 0.6], [cx + r * 0.15, cy - r * 0.6]], P.white, `stroke="${P.ink}" stroke-width="${r1(r * 0.05)}"`);
  }
  out += circle(cx, cy, r * 1.06, P.ink) + circle(cx, cy, r, P.gold) + circle(cx, cy, r * 0.72, P.goldLight) + circle(cx, cy, r * 0.5, P.gold);
  out += `<path d="M ${r1(cx - r * 0.55)} ${r1(cy - r * 0.45)} A ${r1(r * 0.75)} ${r1(r * 0.75)} 0 0 1 ${r1(cx + r * 0.1)} ${r1(cy - r * 0.75)}" stroke="#fff8dc" stroke-width="${r1(r * 0.1)}" fill="none" stroke-linecap="round"/>`;
  return out;
}

export function olympicRings(cx, cy, r) {
  const cols = ['#0081c8', P.ink, '#ee334e', '#fcb131', '#00a651'];
  const pos = [[-2.2, 0], [0, 0], [2.2, 0], [-1.1, 1], [1.1, 1]];
  return pos.map(([dx, dy], i) => circle(cx + dx * r, cy + dy * r, r, 'none', `stroke="${cols[i]}" stroke-width="${r1(r * 0.22)}"`)).join('');
}

// Groupe flouté (pour les arrière-plans).
export function blurred(body, std = 8) {
  const id = 'b' + Math.round(std * 100);
  return `<filter id="${id}"><feGaussianBlur stdDeviation="${std}"/></filter><g filter="url(#${id})">${body}</g>`;
}
