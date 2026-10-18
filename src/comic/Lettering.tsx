// Lettrage BD en SVG : encadrés de narration, onomatopées, titres, cartons de nom, chronos, compteurs, logo.
import React from 'react';
import {Easing, interpolate} from 'remotion';
import type {ComicElement} from './types';
import {useComicTheme} from './theme';

export const COMIC_FONT = 'Bangers, Impact, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const INK = '#000';
// Couleurs d'accent : BD = jaune + rouge ; manga = blanc + rouge vif.
// (variable de module positionnée par <Lettering>, toutes les cases d'un rendu partagent le même thème)
let MANGA = false;
const Y = () => (MANGA ? '#FFFFFF' : '#FFE14D');
const R = () => (MANGA ? '#E3001B' : '#E8202A');

// Bangers est étroite : ~0,5 em par caractère en moyenne.
export const textWidth = (text: string, size: number) => text.length * size * 0.5;

const pop = (dt: number, overshoot = 1.25) =>
  dt < 0 ? 0 : interpolate(dt, [0, 0.09, 0.18], [0.2, overshoot, 1], {...clamp, easing: Easing.out(Easing.quad)});

/** Texte BD : contour noir épais, ombre portée décalée. */
export const InkText: React.FC<{
  x: number;
  y: number;
  size: number;
  fill: string;
  children: string;
  anchor?: 'start' | 'middle' | 'end';
  stroke?: number;
  shadow?: number;
}> = ({x, y, size, fill, children, anchor = 'middle', stroke = size * 0.11, shadow = size * 0.06}) => (
  <>
    {shadow ? (
      <text x={x + shadow} y={y + shadow} fontFamily={COMIC_FONT} fontSize={size} textAnchor={anchor} fill={INK} stroke={INK} strokeWidth={stroke} strokeLinejoin="round">
        {children}
      </text>
    ) : null}
    <text x={x} y={y} fontFamily={COMIC_FONT} fontSize={size} textAnchor={anchor} fill={fill} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" paintOrder="stroke">
      {children}
    </text>
  </>
);

const Caption: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const size = el.size ?? 54;
  const text = el.text ?? '';
  const w = Math.min(960, textWidth(text, size) + 60);
  const slide = interpolate(dt, [0, 0.16], [-140, 0], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <g transform={`translate(${el.x ?? 60} ${(el.y ?? 175) + slide}) rotate(-2)`}>
      <rect x={8} y={8} width={w} height={size * 1.45} fill={INK} />
      <rect x={0} y={0} width={w} height={size * 1.45} fill={Y()} stroke={INK} strokeWidth={7} />
      <text x={30} y={size * 1.05} fontFamily={COMIC_FONT} fontSize={size} fill={INK}>
        {text}
      </text>
    </g>
  );
};

/** Étoile d'impact derrière les onomatopées. */
const burst = (cx: number, cy: number, r: number, spikes = 14, seed = 1) => {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r * (1 + 0.12 * Math.sin(i * 7.3 + seed)) : r * 0.68;
    pts.push(`${(cx + Math.cos(a) * rr * 1.25).toFixed(1)},${(cy + Math.sin(a) * rr * 0.8).toFixed(1)}`);
  }
  return pts.join(' ');
};

const SfxWord: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0 || (el.dur !== undefined && dt > el.dur)) return null; // "dur" : disparaît après n secondes
  const text = el.text ?? '';
  const size = el.size ?? Math.min(170, 640 / Math.max(3, text.length * 0.5));
  const s = pop(dt, 1.3);
  const wobble = Math.sin(dt * 30) * Math.exp(-dt * 6) * 5;
  const fill = el.color === 'red' ? R() : el.color === 'white' ? '#fff' : Y();
  const r = textWidth(text, size) / 2 + 50;
  return (
    <g transform={`translate(${el.x ?? 540} ${el.y ?? 400}) rotate(${(el.rot ?? 0) + wobble}) scale(${s})`}>
      {MANGA ? null : <polygon points={burst(0, -size * 0.32, r, 16, text.length)} fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />}
      <InkText x={0} y={size * 0.02} size={size} fill={fill} stroke={size * 0.13} shadow={size * 0.05}>
        {text}
      </InkText>
    </g>
  );
};

const Title: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const text = el.text ?? '';
  const size = el.size ?? Math.min(150, 960 / Math.max(4, text.length * 0.5));
  const s = pop(dt, 1.18);
  const y = el.y ?? 260;
  return (
    <g transform={`translate(540 ${y}) rotate(-3) scale(${s})`}>
      {el.subtitle ? (
        <InkText x={0} y={-size * 0.95} size={size * 0.38} fill={Y()} shadow={0}>
          {el.subtitle}
        </InkText>
      ) : null}
      <InkText x={0} y={size * 0.35} size={size} fill="#fff">
        {text}
      </InkText>
    </g>
  );
};

const FLAGS: Record<string, string[]> = {
  br: ['#009C3B'],
  nl: ['#AE1C28', '#FFFFFF', '#21468B'],
  us: ['#B22234', '#FFFFFF', '#B22234', '#FFFFFF', '#3C3B6E'],
  jp: ['#FFFFFF'],
  fr: ['#0055A4', '#FFFFFF', '#EF4135'],
  ie: ['#169B62', '#FFFFFF', '#FF883E'],
  th: ['#A51931', '#F4F5F8', '#2D2A4A', '#2D2A4A', '#F4F5F8', '#A51931'],
  ua: ['#0057B7', '#FFD700'],
  gb: ['#012169', '#FFFFFF', '#C8102E', '#FFFFFF', '#012169'],
};

const Flag: React.FC<{code: string; x: number; y: number; h: number}> = ({code, x, y, h}) => {
  const w = h * 1.5;
  if (code === 'br') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#009C3B" stroke={INK} strokeWidth={5} />
        <polygon points={`${x + w / 2},${y + 8} ${x + w - 10},${y + h / 2} ${x + w / 2},${y + h - 8} ${x + 10},${y + h / 2}`} fill="#FFDF00" />
        <circle cx={x + w / 2} cy={y + h / 2} r={h * 0.22} fill="#002776" />
      </g>
    );
  }
  if (code === 'gb') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#012169" />
        <line x1={x} y1={y} x2={x + w} y2={y + h} stroke="#fff" strokeWidth={h * 0.18} />
        <line x1={x + w} y1={y} x2={x} y2={y + h} stroke="#fff" strokeWidth={h * 0.18} />
        <rect x={x} y={y + h * 0.38} width={w} height={h * 0.24} fill="#C8102E" />
        <rect x={x + w * 0.42} y={y} width={w * 0.16} height={h} fill="#C8102E" />
        <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={5} />
      </g>
    );
  }
  if (code === 'jp') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#fff" stroke={INK} strokeWidth={5} />
        <circle cx={x + w / 2} cy={y + h / 2} r={h * 0.3} fill="#BC002D" />
      </g>
    );
  }
  const cols = FLAGS[code] ?? FLAGS.us;
  const vertical = code === 'fr' || code === 'ie';
  return (
    <g>
      {cols.map((c, i) =>
        vertical ? (
          <rect key={i} x={x + (w / cols.length) * i} y={y} width={w / cols.length} height={h} fill={c} />
        ) : (
          <rect key={i} x={x} y={y + (h / cols.length) * i} width={w} height={h / cols.length} fill={c} />
        ),
      )}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={5} />
    </g>
  );
};

const NameCard: React.FC<{el: ComicElement; dt: number; left: number}> = ({el, dt, left}) => {
  if (dt < 0) return null;
  const size = 84;
  const text = el.text ?? '';
  const flagW = el.flag ? 100 : 0;
  const w = textWidth(text, size) + flagW + 70;
  const x = interpolate(dt, [0, 0.2], [-w - 60, 50], {...clamp, easing: Easing.out(Easing.back(1.3))}) - interpolate(left, [0, 0.15], [w + 80, 0], clamp);
  const sub = el.subtitle ?? '';
  const subW = textWidth(sub, 44) + 50;
  return (
    <g transform={`translate(${x} ${el.y ?? 410}) rotate(-2)`}>
      <rect x={9} y={9} width={w} height={118} fill={INK} />
      <rect x={0} y={0} width={w} height={118} fill="#fff" stroke={INK} strokeWidth={7} />
      {el.flag ? <Flag code={el.flag} x={26} y={30} h={58} /> : null}
      <text x={30 + flagW} y={92} fontFamily={COMIC_FONT} fontSize={size} fill={INK}>
        {text}
      </text>
      {sub ? (
        <g transform="translate(30 128)">
          <rect x={0} y={0} width={subW} height={62} fill={R()} stroke={INK} strokeWidth={6} />
          <text x={25} y={47} fontFamily={COMIC_FONT} fontSize={44} fill="#fff">
            {sub}
          </text>
        </g>
      ) : null}
    </g>
  );
};

const Timer: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const s = pop(dt, 1.2);
  return (
    <g transform={`translate(${el.x ?? 800} ${el.y ?? 560}) rotate(6) scale(${s})`}>
      <rect x={-170} y={-95} width={340} height={150} rx={22} fill={INK} />
      <rect x={-178} y={-103} width={340} height={150} rx={22} fill="#fff" stroke={INK} strokeWidth={8} />
      <circle cx={-118} cy={-28} r={34} fill="none" stroke={INK} strokeWidth={8} />
      <line x1={-118} y1={-28} x2={-118} y2={-50} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <line x1={-118} y1={-28} x2={-102} y2={-20} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <text x={40} y={10} textAnchor="middle" fontFamily={COMIC_FONT} fontSize={120} fill={R()} stroke={INK} strokeWidth={6} paintOrder="stroke">
        {el.text}
      </text>
    </g>
  );
};

const Counter: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const p = interpolate(dt, [0, 0.8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const v = Math.round((el.from ?? 0) + ((el.to ?? 0) - (el.from ?? 0)) * p);
  const bump = p >= 1 ? interpolate(dt, [0.8, 0.88, 1], [1, 1.15, 1], clamp) : 1;
  return (
    <g transform={`translate(540 ${el.y ?? 260}) rotate(-4) scale(${pop(dt, 1.15) * bump})`}>
      <InkText x={0} y={70} size={Math.min(210, 960 / (0.5 * Math.max(3, `${el.prefix ?? ''}${el.to ?? ''}${el.suffix ?? ''}`.length)))} fill={Y()}>
        {`${el.prefix ?? ''}${v}${el.suffix ?? ''}`}
      </InkText>
    </g>
  );
};

const Logo: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const [a, ...rest] = (el.text ?? 'HORS LIMITE').split(' ');
  const btn = pop(dt - 0.35, 1.2);
  const pulse = dt > 0.6 ? 1 + Math.max(0, Math.sin((dt - 0.6) * 7)) * 0.07 : 1;
  return (
    <g>
      <g transform={`translate(540 360) rotate(-5) scale(${pop(dt, 1.2)})`}>
        <polygon points={burst(0, -60, 430, 18, 3)} fill={Y()} stroke={INK} strokeWidth={9} />
        <InkText x={0} y={-60} size={170} fill="#fff">
          {a}
        </InkText>
        <InkText x={0} y={100} size={170} fill={R()}>
          {rest.join(' ')}
        </InkText>
      </g>
      {el.subtitle && btn > 0 ? (
        <g transform={`translate(540 620) scale(${btn * pulse})`}>
          <rect x={-230} y={-62} width={470} height={124} rx={62} fill={INK} />
          <rect x={-240} y={-72} width={470} height={124} rx={62} fill={R()} stroke={INK} strokeWidth={8} />
          <text x={-5} y={14} textAnchor="middle" fontFamily={COMIC_FONT} fontSize={86} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke">
            {el.subtitle}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** Bulle de dialogue (queue vers `tail`, relatif à la bulle). */
const Bubble: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const size = el.size ?? 64;
  const text = el.text ?? '';
  const w = textWidth(text, size) + 90;
  const h = size * 1.9;
  const [tx, ty] = (el as {tail?: [number, number]}).tail ?? [-w * 0.25, h * 0.9];
  return (
    <g transform={`translate(${el.x ?? 540} ${el.y ?? 400}) rotate(${el.rot ?? 0}) scale(${pop(dt, 1.15)})`}>
      <path d={`M ${-w * 0.12} ${h * 0.3} L ${tx} ${ty} L ${w * 0.05} ${h * 0.38} Z`} fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse rx={w / 2} ry={h / 2} fill="#fff" stroke={INK} strokeWidth={7} />
      <path d={`M ${-w * 0.1} ${h * 0.28} L ${w * 0.03} ${h * 0.33}`} stroke="#fff" strokeWidth={10} />
      <text x={0} y={size * 0.35} textAnchor="middle" fontFamily={COMIC_FONT} fontSize={size} fill={INK}>
        {text}
      </text>
    </g>
  );
};

export const Lettering: React.FC<{el: ComicElement; t: number; dur: number}> = ({el, t, dur}) => {
  MANGA = useComicTheme().name === 'manga';
  const dt = t - (el.at ?? 0);
  const left = dur - t;
  switch (el.type) {
    case 'caption':
      return <Caption el={el} dt={dt} />;
    case 'sfx':
      return <SfxWord el={el} dt={dt} />;
    case 'title':
      return <Title el={el} dt={dt} />;
    case 'name':
      return <NameCard el={el} dt={dt} left={left} />;
    case 'timer':
      return <Timer el={el} dt={dt} />;
    case 'counter':
      return <Counter el={el} dt={dt} />;
    case 'logo':
      return <Logo el={el} dt={dt} />;
    case 'bubble':
      return <Bubble el={el} dt={dt} />;
    default:
      return null;
  }
};
