// Lettrage "flat design" : cartes et pastilles arrondies, sans contour, ombres douces, typo Montserrat.
import React from 'react';
import {Easing, interpolate} from 'remotion';
import type {ComicElement} from './types';

const FONT = 'Montserrat, Arial Black, sans-serif';
const DARK = '#1D2133';
const YELLOW = '#FFC93C';
const RED = '#FF5A5F';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SHADOW = 'url(#fl-shadow)';

// Montserrat 900 en capitales : ~0,7 em par caractère
const tw = (text: string, size: number) => text.length * size * 0.76;
const pop = (dt: number, over = 1.12) =>
  dt < 0 ? 0 : interpolate(dt, [0, 0.12, 0.24], [0.4, over, 1], {...clamp, easing: Easing.out(Easing.cubic)});

/** Ombre portée commune (à placer une fois dans le <svg>). */
export const FlatDefs: React.FC = () => (
  <defs>
    <filter id="fl-shadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000" floodOpacity="0.22" />
    </filter>
  </defs>
);

const T: React.FC<{x: number; y: number; size: number; fill: string; children: string; anchor?: 'start' | 'middle'; weight?: number}> = ({
  x,
  y,
  size,
  fill,
  children,
  anchor = 'middle',
  weight = 900,
}) => (
  <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={fill} textAnchor={anchor} letterSpacing={-0.5}>
    {children}
  </text>
);

const Caption: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const size = 40;
  const text = el.text ?? '';
  const w = Math.min(960, tw(text, size) + 60);
  const a = interpolate(dt, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <g transform={`translate(${el.x ?? 60} ${(el.y ?? 175) - (1 - a) * 40})`} opacity={a} filter={SHADOW}>
      <rect width={w} height={78} rx={20} fill="#fff" />
      <rect width={14} height={78} rx={7} fill={RED} />
      <T x={40} y={53} size={size} fill={DARK} anchor="start" weight={800}>
        {text}
      </T>
    </g>
  );
};

const Sfx: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const text = el.text ?? '';
  const size = Math.min(el.size ? el.size * 0.7 : 120, 620 / Math.max(3, text.length * 0.7));
  const w = tw(text, size) + 90;
  const h = size * 1.45;
  const fill = el.color === 'red' ? RED : el.color === 'white' ? '#fff' : YELLOW;
  const ink = el.color === 'red' ? '#fff' : DARK;
  return (
    <g transform={`translate(${el.x ?? 540} ${el.y ?? 400}) rotate(${(el.rot ?? 0) * 0.6}) scale(${pop(dt, 1.18)})`} filter={SHADOW}>
      <rect x={-w / 2} y={-h / 2 - size * 0.32} width={w} height={h} rx={h / 2} fill={fill} />
      <T x={0} y={size * 0.02} size={size} fill={ink}>
        {text}
      </T>
    </g>
  );
};

const Title: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const text = el.text ?? '';
  const size = Math.min(el.size ? el.size * 0.6 : 96, 940 / Math.max(4, text.length * 0.7));
  const a = interpolate(dt, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <g transform={`translate(540 ${(el.y ?? 260) + (1 - a) * 30})`} opacity={a}>
      {el.subtitle ? (
        <g filter={SHADOW}>
          <rect x={-tw(el.subtitle, 34) / 2 - 26} y={-size - 40} width={tw(el.subtitle, 34) + 52} height={56} rx={28} fill={RED} />
          <T x={0} y={-size - 1} size={34} fill="#fff" weight={800}>
            {el.subtitle}
          </T>
        </g>
      ) : null}
      <g filter={SHADOW}>
        <T x={0} y={size * 0.35} size={size} fill="#fff">
          {text}
        </T>
      </g>
    </g>
  );
};

const FlagDot: React.FC<{code: string; cx: number; cy: number; r: number}> = ({code, cx, cy, r}) => {
  const id = `flag-${code}-${cx}`;
  const stripes: Record<string, string[]> = {
    nl: ['#AE1C28', '#FFFFFF', '#21468B'],
    us: ['#B22234', '#FFFFFF', '#B22234', '#FFFFFF', '#3C3B6E'],
    fr: ['#0055A4', '#FFFFFF', '#EF4135'],
    ie: ['#169B62', '#FFFFFF', '#FF883E'],
  };
  return (
    <g>
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {code === 'br' ? (
          <>
            <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill="#009C3B" />
            <polygon points={`${cx},${cy - r * 0.7} ${cx + r * 0.85},${cy} ${cx},${cy + r * 0.7} ${cx - r * 0.85},${cy}`} fill="#FFDF00" />
            <circle cx={cx} cy={cy} r={r * 0.36} fill="#002776" />
          </>
        ) : code === 'jp' ? (
          <>
            <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill="#fff" />
            <circle cx={cx} cy={cy} r={r * 0.45} fill="#BC002D" />
          </>
        ) : (
          (stripes[code] ?? stripes.us).map((c, i, arr) =>
            code === 'fr' || code === 'ie' ? (
              <rect key={i} x={cx - r + ((2 * r) / arr.length) * i} y={cy - r} width={(2 * r) / arr.length} height={2 * r} fill={c} />
            ) : (
              <rect key={i} x={cx - r} y={cy - r + ((2 * r) / arr.length) * i} width={2 * r} height={(2 * r) / arr.length} fill={c} />
            ),
          )
        )}
      </g>
    </g>
  );
};

const NameCard: React.FC<{el: ComicElement; dt: number; left: number}> = ({el, dt, left}) => {
  if (dt < 0) return null;
  const size = 60;
  const text = el.text ?? '';
  const flagW = el.flag ? 92 : 0;
  const w = tw(text, size) + flagW + 60;
  const a = interpolate(dt, [0, 0.28], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) * interpolate(left, [0, 0.15], [0, 1], clamp);
  const sub = el.subtitle ?? '';
  return (
    <g transform={`translate(${50 - (1 - a) * 80} ${el.y ?? 410})`} opacity={a}>
      <g filter={SHADOW}>
        <rect width={w} height={110} rx={26} fill="#fff" />
      </g>
      {el.flag ? <FlagDot code={el.flag} cx={62} cy={55} r={32} /> : null}
      <T x={30 + flagW} y={76} size={size} fill={DARK} anchor="start">
        {text}
      </T>
      {sub ? (
        <g transform="translate(24 124)" filter={SHADOW}>
          <rect width={tw(sub, 34) + 40} height={58} rx={29} fill={RED} />
          <T x={22} y={41} size={34} fill="#fff" anchor="start" weight={800}>
            {sub}
          </T>
        </g>
      ) : null}
    </g>
  );
};

const Timer: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  return (
    <g transform={`translate(${el.x ?? 800} ${el.y ?? 560}) scale(${pop(dt)})`} filter={SHADOW}>
      <rect x={-175} y={-80} width={350} height={140} rx={70} fill={DARK} />
      <circle cx={-105} cy={-10} r={32} fill="none" stroke="#fff" strokeWidth={8} />
      <line x1={-105} y1={-10} x2={-105} y2={-30} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      <line x1={-105} y1={-10} x2={-90} y2={-2} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      <T x={40} y={22} size={86} fill="#fff">
        {el.text ?? ''}
      </T>
    </g>
  );
};

const Counter: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const p = interpolate(dt, [0, 0.8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const v = Math.round((el.from ?? 0) + ((el.to ?? 0) - (el.from ?? 0)) * p);
  return (
    <g transform={`translate(540 ${el.y ?? 260}) scale(${pop(dt, 1.08)})`} filter={SHADOW}>
      <T x={0} y={60} size={Math.min(170, 960 / (0.76 * Math.max(3, `${el.prefix ?? ''}${el.to ?? ''}${el.suffix ?? ''}`.length)))} fill="#fff">
        {`${el.prefix ?? ''}${v}${el.suffix ?? ''}`}
      </T>
    </g>
  );
};

const Logo: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const [a, ...rest] = (el.text ?? 'HORS LIMITE').split(' ');
  const btn = pop(dt - 0.35);
  const pulse = dt > 0.6 ? 1 + Math.max(0, Math.sin((dt - 0.6) * 7)) * 0.05 : 1;
  return (
    <g>
      <g transform={`translate(540 300) scale(${pop(dt)})`} filter={SHADOW}>
        <T x={0} y={0} size={150} fill="#fff">
          {a}
        </T>
        <T x={0} y={150} size={150} fill={YELLOW}>
          {rest.join(' ')}
        </T>
      </g>
      {el.subtitle && btn > 0 ? (
        <g transform={`translate(540 560) scale(${btn * pulse})`} filter={SHADOW}>
          <rect x={-250} y={-62} width={500} height={124} rx={62} fill={RED} />
          <T x={0} y={22} size={62} fill="#fff">
            {el.subtitle}
          </T>
        </g>
      ) : null}
    </g>
  );
};

/** Bulle de dialogue arrondie avec petite queue (vers `tail`, relatif à la bulle). */
const Bubble: React.FC<{el: ComicElement; dt: number}> = ({el, dt}) => {
  if (dt < 0) return null;
  const size = el.size ? el.size * 0.75 : 48;
  const text = el.text ?? '';
  const w = tw(text, size) + 70;
  const h = size * 1.9;
  const [tx, ty] = (el as {tail?: [number, number]}).tail ?? [-w * 0.25, h * 0.95];
  return (
    <g transform={`translate(${el.x ?? 540} ${el.y ?? 400}) rotate(${(el.rot ?? 0) * 0.5}) scale(${pop(dt, 1.12)})`} filter={SHADOW}>
      <path d={`M ${-w * 0.15} ${h * 0.2} L ${tx} ${ty} L ${w * 0.08} ${h * 0.2} Z`} fill="#fff" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#fff" />
      <T x={0} y={size * 0.36} size={size} fill={DARK}>
        {text}
      </T>
    </g>
  );
};

export const FlatLettering: React.FC<{el: ComicElement; t: number; dur: number}> = ({el, t, dur}) => {
  const dt = t - (el.at ?? 0);
  switch (el.type) {
    case 'caption':
      return <Caption el={el} dt={dt} />;
    case 'sfx':
      return <Sfx el={el} dt={dt} />;
    case 'title':
      return <Title el={el} dt={dt} />;
    case 'name':
      return <NameCard el={el} dt={dt} left={dur - t} />;
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
