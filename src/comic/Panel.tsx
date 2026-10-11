// Une case de BD plein écran : fond coloré tramé, lignes de vitesse, sol, personnages, décors, lettrage.
import React from 'react';
import {Easing, interpolate, random} from 'remotion';
import {Lettering as ComicLettering} from './Lettering';
import {FlatDefs, FlatLettering} from './FlatLettering';
import {useComicTheme} from './theme';
import {PROPS} from './Props';
import {Puppet} from './Puppet';
import {poseAt, POSES} from './poses';
import type {ComicElement, ComicPanel} from './types';

export const W = 1080;
export const H = 1920;
export const FLOOR_Y = 1060;
// Scène : les coordonnées du storyboard (sol à y = 1060) sont agrandies et descendues
// pour remplir l'écran ; les sous-titres se placent sur la bande de sol, sous la scène.
export const STAGE = {floor: 1290, scale: 1.16};
const stage = `translate(540 ${STAGE.floor}) scale(${STAGE.scale}) translate(-540 ${-FLOOR_Y})`;
const ON_STAGE = new Set(['sfx', 'timer']);
const GUTTER = 22;
const BORDER = 13;
const INK = '#000';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const PALETTE: Record<string, [string, string]> = {
  // [fond, sol]
  blue: ['#2F80ED', '#1B4F9C'],
  yellow: ['#FFD43B', '#D99A1B'],
  red: ['#F0433A', '#A61E1E'],
  purple: ['#8B5CF6', '#5130A8'],
  cyan: ['#22C3E6', '#137E99'],
  orange: ['#FF8A1F', '#B8520A'],
  green: ['#2DBE6C', '#167A42'],
  pink: ['#FF5C9A', '#B32A63'],
  sepia: ['#E9D3A6', '#B89B68'],
};

/** Lettrage selon le thème (BD ou flat). */
const Lettering: React.FC<{el: ComicElement; t: number; dur: number}> = (props) =>
  useComicTheme().name === 'flat' ? <FlatLettering {...props} /> : <ComicLettering {...props} />;

export const FLAT_PALETTE: Record<string, [string, string]> = {
  blue: ['#4A7BF7', '#3159C4'],
  yellow: ['#FFC93C', '#E5A50F'],
  red: ['#FF5A5F', '#D63A40'],
  purple: ['#7B61FF', '#5A3FE0'],
  cyan: ['#2EC4B6', '#1E9A8F'],
  orange: ['#FF9F1C', '#E07B00'],
  green: ['#3DDC97', '#22B375'],
  pink: ['#FF7AA2', '#E2557F'],
  sepia: ['#F1E3C6', '#D9C39A'],
};

/** Fond flat : aplat + grandes formes douces qui dérivent lentement. */
const FlatBackground: React.FC<{id: string; color: string; t: number; focus: [number, number]}> = ({id, color, t, focus}) => (
  <g>
    <defs>
      <radialGradient id={`flglow-${id}`} cx={focus[0] / W} cy={focus[1] / H} r={0.7}>
        <stop offset="0" stopColor="rgba(255,255,255,0.22)" />
        <stop offset="1" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={color} />
    {[
      [180, 380, 260],
      [900, 260, 200],
      [820, 900, 320],
      [120, 1000, 180],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x + Math.sin(t * 0.6 + i) * 25} cy={y + Math.cos(t * 0.5 + i) * 20} r={r} fill="rgba(255,255,255,0.1)" />
    ))}
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#flglow-${id})`} />
  </g>
);

const LETTERING = new Set(['caption', 'sfx', 'title', 'name', 'timer', 'counter', 'logo']);

/** Trame de points + dégradé lumineux + lignes de vitesse en éventail. */
const Background: React.FC<{id: string; color: string; rays?: boolean; t: number; focus: [number, number]}> = ({id, color, rays, t, focus}) => {
  const n = 28;
  return (
    <g>
      <defs>
        <pattern id={`dots-${id}`} width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx={11} cy={11} r={4.2} fill="rgba(0,0,0,0.16)" />
        </pattern>
        <radialGradient id={`glow-${id}`} cx={focus[0] / W} cy={focus[1] / H} r={0.75}>
          <stop offset="0" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="0.55" stopColor="rgba(255,255,255,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.25)" />
        </radialGradient>
      </defs>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={color} />
      {rays ? (
        <g transform={`rotate(${t * 6} ${focus[0]} ${focus[1]})`}>
          {Array.from({length: n}, (_, i) => {
            const a0 = (i / n) * Math.PI * 2;
            const a1 = a0 + (Math.PI * 2) / n / 2;
            const R = 2600;
            const [fx, fy] = focus;
            return (
              <polygon
                key={i}
                points={`${fx},${fy} ${fx + Math.cos(a0) * R},${fy + Math.sin(a0) * R} ${fx + Math.cos(a1) * R},${fy + Math.sin(a1) * R}`}
                fill="rgba(255,255,255,0.16)"
              />
            );
          })}
        </g>
      ) : null}
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#dots-${id})`} />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#glow-${id})`} />
    </g>
  );
};

/** Valeur de pose à l'instant t, avec cycles (marche, tapes au sol…). */
function puppetPose(el: ComicElement, t: number) {
  const c = el.cycle;
  if (c && t >= c.from && (c.until === null || c.until === undefined || t < c.until)) {
    const i = Math.floor((t - c.from) / c.every) % c.poses.length;
    return POSES[c.poses[i]] ?? POSES.stand;
  }
  return poseAt(el.poses ?? [{pose: 'stand', t: 0}], t);
}

export const SceneElement: React.FC<{el: ComicElement; t: number; dur: number; floor: number; idp: string}> = ({el, t, dur, floor, idp}) => {
  const th = useComicTheme();
  const flat = th.name === 'flat';
  let x = el.x ?? W / 2;
  let y = el.y ?? floor;
  if (el.move) {
    const p = interpolate(t, [el.move.at, el.move.at + el.move.dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
    x += (el.move.to[0] - x) * p;
    y += (el.move.to[1] - y) * p;
  }
  const s = el.s ?? 1;
  switch (el.type) {
    case 'puppet':
      return (
        <g transform={`translate(${x} ${y}) scale(${s * (el.facing ?? 1)} ${s})`}>
          {flat && Math.abs(y - floor) < 4 ? <ellipse cx={0} cy={0} rx={48} ry={7} fill="rgba(0,0,0,0.18)" /> : null}
          <Puppet filter={flat ? 'url(#fl-shadow)' : undefined} pose={puppetPose(el, t)} build={el.build} style={el.style} glove={el.glove} sepia={el.sepia} />
        </g>
      );
    case 'prop': {
      const P = PROPS[el.name ?? ''];
      return P ? (
        <g transform={`translate(${x} ${y}) rotate(${el.rot ?? 0}) scale(${s})`}>
          <P el={el} t={t} th={th} />
        </g>
      ) : null;
    }
    case 'inset': {
      const w = el.w ?? 500;
      const h = el.h ?? 500;
      const pal = flat ? FLAT_PALETTE : PALETTE;
      const [bg, fl] = pal[el.bg ?? 'sepia'] ?? pal.sepia;
      const id = `${idp}-inset`;
      const appear = interpolate(t, [0, 0.15], [0.6, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
      return (
        <g transform={`translate(${x + w / 2} ${y + h / 2}) rotate(${el.rot ?? 0}) scale(${appear}) translate(${-w / 2} ${-h / 2})`}>
          {flat ? null : <rect x={12} y={12} width={w} height={h} fill={INK} />}
          {flat ? <rect width={w} height={h} rx={36} fill="#fff" filter="url(#fl-shadow)" /> : null}
          <clipPath id={`clip-${id}`}>
            <rect width={w} height={h} rx={flat ? 36 : 0} />
          </clipPath>
          <g clipPath={`url(#clip-${id})`}>
            <rect width={w} height={h} fill={bg} />
            <rect y={(el.elements?.[0]?.y ?? h - 40)} width={w} height={h} fill={fl} />
            {(el.elements ?? []).map((c, i) =>
              LETTERING.has(c.type) ? (
                <Lettering key={i} el={c} t={t} dur={dur} />
              ) : (
                <SceneElement key={i} el={c} t={t} dur={dur} floor={h - 40} idp={`${id}-${i}`} />
              ),
            )}
          </g>
          {flat ? null : <rect width={w} height={h} fill="none" stroke={INK} strokeWidth={10} />}
        </g>
      );
    }
    default:
      return null;
  }
};

/** Coup de zoom (punch) et tremblement autour des instants d'effet. */
export function panelFx(panel: ComicPanel, t: number) {
  let punch = 0;
  let shake = 0;
  let flash = 0;
  for (const f of panel.fx) {
    const dt = t - f.at;
    if (dt < 0) continue;
    if (f.type === 'punch') punch = Math.max(punch, interpolate(dt, [0, 0.06, 0.5], [0, 0.16, 0.04], clamp));
    if (f.type === 'shake') shake = Math.max(shake, 30 * Math.exp(-dt * 7));
    if (f.type === 'flash') flash = Math.max(flash, interpolate(dt, [0, 0.25], [0.85, 0], clamp));
  }
  return {punch, shake, flash};
}

export const Panel: React.FC<{panel: ComicPanel; t: number; frame: number}> = ({panel, t, frame}) => {
  const th = useComicTheme();
  const flat = th.name === 'flat';
  const dur = panel.end - panel.start;
  const pal = flat ? FLAT_PALETTE : PALETTE;
  const [bg, floorColor] = pal[panel.bg] ?? pal.blue;
  const gutter = flat ? 0 : GUTTER;
  const cam = panel.camera ?? {zoom: [1, 1.06], focus: [540, 760]};
  // le point de mire est donné dans le repère du storyboard : on le projette sur la scène
  const focus: [number, number] = [
    540 + (cam.focus[0] - 540) * STAGE.scale,
    STAGE.floor + (cam.focus[1] - FLOOR_Y) * STAGE.scale,
  ];
  const {punch, shake, flash} = panelFx(panel, t);
  const zoom = interpolate(t, [0, dur], cam.zoom, clamp) * (1 + punch);
  const sx = (random(`sx${frame}`) * 2 - 1) * shake;
  const sy = (random(`sy${frame}`) * 2 - 1) * shake;
  const hasFloor = panel.floor !== null;
  const id = panel.id;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      {flat ? <FlatDefs /> : null}
      <rect width={W} height={H} fill="#fff" />
      <clipPath id={`frame-${id}`}>
        <rect x={gutter} y={gutter} width={W - gutter * 2} height={H - gutter * 2} />
      </clipPath>
      <g clipPath={`url(#frame-${id})`}>
        <g transform={`translate(${sx} ${sy})`}>
          <g transform={`translate(${focus[0]} ${focus[1]}) scale(${zoom}) translate(${-focus[0]} ${-focus[1]})`}>
            {flat ? (
              <FlatBackground id={id} color={bg} t={t} focus={focus} />
            ) : (
              <Background id={id} color={bg} rays={panel.rays} t={t} focus={focus} />
            )}
            <g transform={stage}>
            {hasFloor ? (
              <g>
                <rect x={-600} y={FLOOR_Y} width={W + 1200} height={H} fill={floorColor} />
                {flat ? null : <rect x={-600} y={FLOOR_Y} width={W + 1200} height={H} fill={`url(#dots-${id})`} />}
                {flat ? null : <line x1={-600} x2={W + 600} y1={FLOOR_Y} y2={FLOOR_Y} stroke={INK} strokeWidth={10} />}
              </g>
            ) : null}
            {panel.elements.map((el, i) =>
              LETTERING.has(el.type) ? null : <SceneElement key={i} el={el} t={t} dur={dur} floor={FLOOR_Y} idp={`${id}-${i}`} />,
            )}
            </g>
          </g>
          <g transform={stage}>
            {panel.elements.map((el, i) => (ON_STAGE.has(el.type) ? <Lettering key={i} el={el} t={t} dur={dur} /> : null))}
          </g>
          {panel.elements.map((el, i) => (LETTERING.has(el.type) && !ON_STAGE.has(el.type) ? <Lettering key={i} el={el} t={t} dur={dur} /> : null))}
        </g>
        {flash > 0.01 ? <rect width={W} height={H} fill="#fff" opacity={flash} /> : null}
      </g>
      {flat ? null : <rect x={GUTTER} y={GUTTER} width={W - GUTTER * 2} height={H - GUTTER * 2} fill="none" stroke={INK} strokeWidth={BORDER} />}
    </svg>
  );
};
