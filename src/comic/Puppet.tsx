import React from 'react';
import {BUILDS, Pose} from './poses';
import {useComicTheme} from './theme';

export type PuppetStyle = 'hero' | 'shadow';

export type PuppetProps = {
  pose: Pose;
  build?: string;
  style?: PuppetStyle; // hero = kimono blanc ceinture noire ; shadow = silhouette noire
  glove?: boolean; // un seul gant de boxe (main avant)
  gloves?: string; // gants de MMA sur les deux mains (couleur)
  headband?: string; // mongkhon du muay-thaï (couleur) + brassards
  tint?: string; // couleur du combattant (style shadow) : ex. vert pour McGregor
  sepia?: boolean;
  filter?: string;
};

type P = {x: number; y: number};
const rad = (d: number) => (d * Math.PI) / 180;
const dir = (a: number): P => ({x: Math.sin(rad(a)), y: Math.cos(rad(a))});
const add = (p: P, d: P, k: number): P => ({x: p.x + d.x * k, y: p.y + d.y * k});

/** Assombrit (k < 0) ou éclaircit (k > 0) une couleur #rrggbb. */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')}`;
};

const Seg: React.FC<{a: P; b: P; w: number; fill: string; line: string; ow: number}> = ({a, b, w, fill, line, ow}) => (
  <>
    {ow > 0 ? <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={line} strokeWidth={w + ow * 2} strokeLinecap="round" /> : null}
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={fill} strokeWidth={w} strokeLinecap="round" />
  </>
);

/** Pantin dessiné en SVG, pieds à l'origine, tourné vers la droite. */
export const Puppet: React.FC<PuppetProps> = ({pose, build = 'normal', style = 'shadow', glove, gloves, headband, tint, sepia, filter}) => {
  const b = BUILDS[build] ?? BUILDS.normal;
  const hero = style === 'hero';
  const th = useComicTheme();
  const flat = th.name === 'flat' || th.name === 'neon';
  const ow = flat ? 0 : 5;
  const line = flat ? 'none' : '#000';
  const front = hero ? th.hero : sepia ? '#3b2a1a' : tint ?? th.shadow;
  const back = hero ? th.heroBack : sepia ? '#5a4330' : tint ? shade(tint, -0.28) : th.shadowBack;
  const beltColor = flat ? th.shadow : '#000';
  const lapel = flat ? '#C5CBD6' : line;
  const skin = '#F1C59B';

  const legLen = b.thigh + b.shin;
  const H: P = {x: (pose.dx ?? 0) * legLen, y: -legLen};
  const tdir: P = {x: Math.sin(rad(pose.torso)), y: -Math.cos(rad(pose.torso))};
  const perp: P = {x: Math.cos(rad(pose.torso)), y: Math.sin(rad(pose.torso))};
  const N = add(H, tdir, b.torso);
  const S = add(H, tdir, b.torso * 0.88);
  const hdir: P = {x: Math.sin(rad(pose.torso + pose.head)), y: -Math.cos(rad(pose.torso + pose.head))};
  const C = add(N, hdir, b.head * 1.15);

  const arm = (l: {a: number; b: number}) => {
    const E = add(S, dir(l.a), b.upper);
    const W = add(E, dir(l.a + l.b), b.fore);
    return {E, W};
  };
  const leg = (l: {a: number; b: number}) => {
    const K = add(H, dir(l.a), b.thigh);
    const F = add(K, dir(l.a + l.b), b.shin);
    // pied : perpendiculaire au tibia, vers l'avant
    const T = add(F, dir(l.a + l.b + 90), b.limb * 0.9);
    return {K, F, T};
  };
  const aF = arm(pose.armF);
  const aB = arm(pose.armB);
  const lF = leg(pose.legF);
  const lB = leg(pose.legB);

  const limbW = b.limb;

  // Calage au sol : le point le plus bas (après rotation) touche y = 0.
  const r = rad(pose.rot ?? 0);
  const rotY = (p: P) => H.y + (p.x - H.x) * Math.sin(r) + (p.y - H.y) * Math.cos(r);
  const lowest = Math.max(
    ...[lF.F, lF.T, lB.F, lB.T, lF.K, lB.K, H, C, aF.W, aB.W, aF.E, aB.E].map(rotY),
  );
  const ground = -(lowest + limbW * 0.5 + ow);
  const torsoPath = [
    add(H, perp, -b.hipW / 2),
    add(H, perp, b.hipW / 2),
    add(N, perp, b.shoulderW / 2),
    add(N, perp, -b.shoulderW / 2),
  ];
  const tp = `M${torsoPath.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')} Z`;

  const drawLeg = (l: ReturnType<typeof leg>, fill: string) => (
    <>
      <Seg a={H} b={l.K} w={limbW * 1.15} fill={fill} line={line} ow={ow} />
      <Seg a={l.K} b={l.F} w={limbW} fill={fill} line={line} ow={ow} />
      <Seg a={l.F} b={l.T} w={limbW * 0.75} fill={hero ? skin : fill} line={line} ow={ow} />
    </>
  );
  const drawArm = (a: ReturnType<typeof arm>, fill: string, gloveColor?: string) => (
    <>
      <Seg a={S} b={a.E} w={limbW} fill={fill} line={line} ow={ow} />
      {build === 'muscle' ? (
        <ellipse
          cx={(S.x + a.E.x) / 2}
          cy={(S.y + a.E.y) / 2}
          rx={limbW * 0.85}
          ry={limbW * 0.65}
          fill={fill}
          stroke={line}
          strokeWidth={ow}
        />
      ) : null}
      <Seg a={a.E} b={a.W} w={limbW * 0.9} fill={fill} line={line} ow={ow} />
      {gloveColor ? (
        <circle cx={a.W.x} cy={a.W.y} r={limbW * (gloves ? 0.85 : 1.05)} fill={gloveColor} stroke={line} strokeWidth={ow} />
      ) : (
        <circle cx={a.W.x} cy={a.W.y} r={limbW * 0.62} fill={hero ? skin : fill} stroke={line} strokeWidth={ow} />
      )}
    </>
  );

  // Ceinture noire du kimono : bande à la taille + deux pans
  const beltC = add(H, tdir, b.torso * 0.16);
  const beltL = add(beltC, perp, -b.hipW / 2 - 2);
  const beltR = add(beltC, perp, b.hipW / 2 + 2);
  const knot = add(beltC, perp, b.hipW * 0.22);

  return (
    <g transform={`translate(0 ${ground}) rotate(${pose.rot ?? 0} ${H.x} ${H.y})`} strokeLinejoin="round" filter={filter}>
      {drawLeg(lB, back)}
      {drawArm(aB, back, gloves ? shade(gloves, -0.25) : undefined)}
      <path d={tp} fill={front} stroke={line} strokeWidth={ow} />
      {b.belly ? (
        <ellipse
          cx={add(add(H, tdir, b.torso * 0.4), perp, b.belly * 0.18).x}
          cy={add(add(H, tdir, b.torso * 0.4), perp, b.belly * 0.18).y}
          rx={b.belly * 0.62}
          ry={b.torso * 0.42}
          fill={front}
          stroke={line}
          strokeWidth={ow}
          transform={`rotate(${pose.torso} ${add(H, tdir, b.torso * 0.4).x} ${add(H, tdir, b.torso * 0.4).y})`}
        />
      ) : null}
      {b.belly ? (
        <line x1={beltL.x} y1={beltL.y} x2={beltR.x} y2={beltR.y} stroke="#6b6b6b" strokeWidth={14} />
      ) : null}
      {hero ? (
        <>
          {/* revers du kimono */}
          <polyline
            points={`${add(N, perp, -b.shoulderW * 0.3).x},${add(N, perp, -b.shoulderW * 0.3).y} ${add(beltC, perp, b.hipW * 0.12).x},${add(beltC, perp, b.hipW * 0.12).y} ${add(N, perp, b.shoulderW * 0.3).x},${add(N, perp, b.shoulderW * 0.3).y}`}
            fill="none"
            stroke={lapel}
            strokeWidth={flat ? 4 : 3.5}
          />
          <line x1={beltL.x} y1={beltL.y} x2={beltR.x} y2={beltR.y} stroke={beltColor} strokeWidth={10} strokeLinecap="round" />
          <line x1={knot.x} y1={knot.y} x2={knot.x + 4} y2={knot.y + 16} stroke={beltColor} strokeWidth={6} strokeLinecap="round" />
          <line x1={knot.x} y1={knot.y} x2={knot.x - 5} y2={knot.y + 15} stroke={beltColor} strokeWidth={6} strokeLinecap="round" />
        </>
      ) : null}
      {drawLeg(lF, front)}
      {/* tête */}
      <circle cx={C.x} cy={C.y} r={b.head} fill={hero ? skin : front} stroke={line} strokeWidth={ow} />
      {headband
        ? (() => {
            const ha = rad(pose.torso + pose.head);
            const up = {x: Math.sin(ha), y: -Math.cos(ha)};
            const side = {x: Math.cos(ha), y: Math.sin(ha)};
            const c0 = add(C, up, b.head * 0.38);
            const p1 = add(c0, side, -b.head * 1.02);
            const p2 = add(c0, side, b.head * 1.02);
            const tail = add(add(p1, up, -b.head * 0.9), side, -b.head * 0.5);
            return (
              <g>
                <line x1={p1.x} y1={p1.y} x2={tail.x} y2={tail.y} stroke={headband} strokeWidth={5} strokeLinecap="round" />
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={headband} strokeWidth={b.head * 0.38} strokeLinecap="round" />
              </g>
            );
          })()
        : null}
      {hero ? (
        <>
          <path
            d={`M ${C.x - b.head} ${C.y - 1} A ${b.head} ${b.head} 0 0 1 ${C.x + b.head * 0.85} ${C.y - b.head * 0.5} L ${C.x - b.head * 0.2} ${C.y - b.head * 0.35} Z`}
            fill="#1a1a1a"
            transform={`rotate(${pose.torso + pose.head} ${C.x} ${C.y})`}
          />
          <circle
            cx={add(C, {x: Math.cos(rad(pose.torso + pose.head)), y: Math.sin(rad(pose.torso + pose.head))}, b.head * 0.55).x}
            cy={add(C, {x: Math.cos(rad(pose.torso + pose.head)), y: Math.sin(rad(pose.torso + pose.head))}, b.head * 0.55).y + 2}
            r={2.6}
            fill="#000"
          />
        </>
      ) : null}
      {drawArm(aF, front, gloves ?? (glove ? '#D7262E' : undefined))}
      {headband ? (
        <line
          x1={add(S, dir(pose.armF.a), b.upper * 0.45).x - Math.cos(rad(pose.armF.a)) * limbW * 0.6}
          y1={add(S, dir(pose.armF.a), b.upper * 0.45).y + Math.sin(rad(pose.armF.a)) * limbW * 0.6}
          x2={add(S, dir(pose.armF.a), b.upper * 0.45).x + Math.cos(rad(pose.armF.a)) * limbW * 0.6}
          y2={add(S, dir(pose.armF.a), b.upper * 0.45).y - Math.sin(rad(pose.armF.a)) * limbW * 0.6}
          stroke={headband}
          strokeWidth={limbW * 0.45}
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
};

/** Hauteur approximative (debout) d'une morphologie, pour placer les personnages. */
export const puppetHeight = (build = 'normal') => {
  const b = BUILDS[build] ?? BUILDS.normal;
  return b.thigh + b.shin + b.torso + b.head * 2.3;
};
