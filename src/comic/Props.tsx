// Décors et accessoires dessinés en SVG, style BD (contours noirs épais).
import React from 'react';
import {Easing, interpolate, random} from 'remotion';
import {Puppet} from './Puppet';
import {POSES} from './poses';
import type {ComicElement} from './types';

const INK = '#000';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type PropFC = React.FC<{el: ComicElement; t: number}>;

/** Ville de nuit + montagnes : origine = milieu du sol. */
const City: PropFC = ({t}) => {
  const buildings = Array.from({length: 11}, (_, i) => {
    const w = 70 + random(`bw${i}`) * 60;
    const h = 220 + random(`bh${i}`) * 420;
    return {x: -560 + i * 104, w, h};
  });
  const sweep = Math.sin(t * 1.4) * 18;
  return (
    <g>
      <circle cx={300} cy={-860} r={70} fill="#FFF3B0" stroke={INK} strokeWidth={7} />
      <polygon points="-600,-360 -380,-700 -180,-420 40,-760 260,-430 430,-640 640,-360" fill="#B9A6F2" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <polygon points="-380,-700 -330,-620 -420,-640" fill="#fff" />
      <polygon points="40,-760 95,-660 -10,-680" fill="#fff" />
      {[-200, 220].map((x, i) => (
        <polygon
          key={i}
          points={`${x},0 ${x - 70},-1000 ${x + 70},-1000`}
          fill="rgba(255,250,200,0.35)"
          transform={`rotate(${(i ? -1 : 1) * (12 + sweep)} ${x} 0)`}
        />
      ))}
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={-b.h} width={b.w} height={b.h} fill="#1F1B4D" stroke={INK} strokeWidth={6} />
          {Array.from({length: Math.floor(b.h / 60)}, (_, r) =>
            Array.from({length: Math.floor(b.w / 34)}, (_, c) =>
              random(`win${i}-${r}-${c}`) > 0.45 ? (
                <rect key={`${r}-${c}`} x={b.x + 12 + c * 32} y={-b.h + 20 + r * 58} width={16} height={26} fill="#FFD43B" />
              ) : null,
            ),
          )}
        </g>
      ))}
    </g>
  );
};

/** Cage à huit côtés vue du dessus : origine = centre. */
const Cage: PropFC = ({t}) => {
  const oct = (r: number) =>
    Array.from({length: 8}, (_, i) => {
      const a = (Math.PI / 8) * (2 * i + 1);
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    }).join(' ');
  return (
    <g transform={`rotate(${t * 4})`}>
      <polygon points={oct(430)} fill="#2a2a2a" stroke={INK} strokeWidth={10} />
      <polygon points={oct(395)} fill="none" stroke="#9aa3ad" strokeWidth={34} strokeDasharray="6 10" />
      <polygon points={oct(370)} fill="#E9EEF3" stroke={INK} strokeWidth={8} />
      <circle r={120} fill="none" stroke="#c8d0d8" strokeWidth={10} />
      <circle r={40} fill="#E8202A" stroke={INK} strokeWidth={6} />
      {Array.from({length: 8}, (_, i) => {
        const a = (Math.PI / 4) * i;
        return <circle key={i} cx={Math.cos(a) * 430} cy={Math.sin(a) * 430} r={22} fill="#555" stroke={INK} strokeWidth={6} />;
      })}
    </g>
  );
};

/** Pèse-personne qui casse : origine = milieu du sol. */
const Scale: PropFC = ({el, t}) => {
  const k = el.breakAt ?? 1;
  const needle = interpolate(t, [0, k - 0.1, k], [-60, 60, 150], clamp);
  const broken = t >= k;
  const squash = broken ? 0.9 : 1;
  return (
    <g transform={`scale(1 ${squash})`}>
      <rect x={-240} y={-150} width={480} height={150} rx={30} fill="#f2f2f2" stroke={INK} strokeWidth={9} />
      <circle cx={0} cy={-75} r={58} fill="#fff" stroke={INK} strokeWidth={7} />
      <line x1={0} y1={-75} x2={Math.sin((needle * Math.PI) / 180) * 48} y2={-75 - Math.cos((needle * Math.PI) / 180) * 48} stroke="#E8202A" strokeWidth={7} strokeLinecap="round" />
      {broken ? (
        <g stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round">
          <polyline points="-30,-120 -5,-80 -40,-50 -10,-20" />
          <polyline points="20,-130 35,-95 10,-70 40,-40" />
          <polyline points="-160,-150 -140,-110 -170,-80" />
          <polyline points="150,-150 130,-105 165,-60" />
        </g>
      ) : null}
    </g>
  );
};

/** Livre de règles déchiré en deux : origine = centre. */
const RuleBook: PropFC = ({el, t}) => {
  const k = el.tearAt ?? 1;
  const p = interpolate(t, [k, k + 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const page = (side: 1 | -1) => (
    <g transform={`translate(${side * p * 160} ${p * 80}) rotate(${side * p * 28})`}>
      <rect x={side === 1 ? 0 : -300} y={-210} width={300} height={420} fill="#FFFDF2" stroke={INK} strokeWidth={9} />
      {Array.from({length: 9}, (_, i) => (
        <line
          key={i}
          x1={side === 1 ? 40 : -260}
          x2={side === 1 ? 260 : -40}
          y1={-130 + i * 36}
          y2={-130 + i * 36}
          stroke="#888"
          strokeWidth={8}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
  return (
    <g>
      {page(-1)}
      {page(1)}
      {p < 0.2 ? (
        <text x={0} y={-240} textAnchor="middle" fontFamily="Bangers, Impact" fontSize={90} fill="#E8202A" stroke={INK} strokeWidth={6} paintOrder="stroke">
          RÈGLES
        </text>
      ) : null}
      {p > 0
        ? Array.from({length: 10}, (_, i) => (
            <rect
              key={i}
              x={(random(`px${i}`) - 0.5) * 500 * p}
              y={-200 + random(`py${i}`) * 400 * p}
              width={30}
              height={22}
              fill="#FFFDF2"
              stroke={INK}
              strokeWidth={4}
              transform={`rotate(${random(`pr${i}`) * 360 * p})`}
            />
          ))
        : null}
    </g>
  );
};

/** Dent qui s'envole (apparaît à `at`). */
const Tooth: PropFC = ({el, t}) => {
  const dt = t - (el.at ?? 0);
  if (dt < 0) return null;
  const x = dt * 520;
  const y = -dt * 700 + dt * dt * 900;
  return (
    <g transform={`translate(${x} ${y}) rotate(${dt * 720})`}>
      <path
        d="M -26 -30 Q -30 -48 -12 -46 Q 0 -40 12 -46 Q 30 -48 26 -30 L 20 10 Q 16 26 8 30 Q 4 10 0 6 Q -4 10 -8 30 Q -16 26 -20 10 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <line x1={-70} y1={-60} x2={-40} y2={-40} stroke={INK} strokeWidth={5} />
      <line x1={-80} y1={-20} x2={-45} y2={-15} stroke={INK} strokeWidth={5} />
    </g>
  );
};

const CONFETTI = ['#E8202A', '#FFE14D', '#2F80ED', '#2DBE6C', '#FF5C9A', '#fff'];
const Confetti: PropFC = ({t}) => (
  <g>
    {Array.from({length: 70}, (_, i) => {
      const x0 = (random(`cx${i}`) - 0.5) * 1100;
      const speed = 380 + random(`cs${i}`) * 420;
      const y = -120 + ((t * speed + random(`cy${i}`) * 1600) % 1700);
      const x = x0 + Math.sin(t * 3 + i) * 30;
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={22}
          height={34}
          fill={CONFETTI[i % CONFETTI.length]}
          stroke={INK}
          strokeWidth={3}
          transform={`rotate(${t * 300 + i * 40} ${x + 11} ${y + 17})`}
        />
      );
    })}
  </g>
);

/** Globe terrestre qui tourne, ceinture noire en orbite : origine = centre. */
const Globe: PropFC = ({t}) => {
  const r = 300;
  const spin = (t * 60) % 120;
  return (
    <g>
      <circle r={r + 14} fill={INK} />
      <circle r={r} fill="#3BA3F0" />
      <clipPath id="globeClip">
        <circle r={r} />
      </clipPath>
      <g clipPath="url(#globeClip)">
        {[-240, -120, 0, 120, 240, 360].map((x0, i) => (
          <path
            key={i}
            transform={`translate(${x0 + spin - 120} ${i % 2 ? -60 : 40})`}
            d="M -60 -90 Q 20 -140 70 -60 Q 110 20 40 60 Q -20 120 -70 40 Q -110 -30 -60 -90 Z"
            fill="#4CC36B"
            stroke={INK}
            strokeWidth={6}
          />
        ))}
        {[-0.6, 0, 0.6].map((k, i) => (
          <ellipse key={i} rx={r * Math.abs(Math.cos(spin / 40 + k))} ry={r} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={4} />
        ))}
      </g>
      <circle r={r} fill="none" stroke={INK} strokeWidth={10} />
      <g transform={`rotate(-18)`}>
        <ellipse rx={r * 1.35} ry={r * 0.32} fill="none" stroke={INK} strokeWidth={34} strokeDasharray={`${r * 2.2} ${r * 10}`} strokeDashoffset={-t * 300} />
      </g>
    </g>
  );
};

/** Balance : la technique (petit pantin blanc) l'emporte sur la force (gros bras noir). Origine = milieu du sol. */
const Balance: PropFC = ({el, t}) => {
  const k = el.at ?? 0.5;
  const tilt = interpolate(t, [k - 0.3, k, k + 0.25], [-10, -10, 16], {...clamp, easing: Easing.out(Easing.back(2))});
  const arm = 360;
  const post = 620;
  const a = (tilt * Math.PI) / 180;
  const L = {x: -Math.cos(a) * arm, y: -post - Math.sin(-a) * arm};
  const R = {x: Math.cos(a) * arm, y: -post + Math.sin(-a) * arm};
  const plate = (p: {x: number; y: number}, children: React.ReactNode, label: string) => (
    <g transform={`translate(${p.x} ${p.y})`}>
      <line x1={0} y1={0} x2={-100} y2={200} stroke={INK} strokeWidth={6} />
      <line x1={0} y1={0} x2={100} y2={200} stroke={INK} strokeWidth={6} />
      <path d="M -130 200 Q 0 260 130 200 Z" fill="#FFD43B" stroke={INK} strokeWidth={8} />
      <g transform="translate(0 205)">{children}</g>
      <text x={0} y={330} textAnchor="middle" fontFamily="Bangers, Impact" fontSize={70} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">
        {label}
      </text>
    </g>
  );
  return (
    <g>
      <rect x={-20} y={-post} width={40} height={post} fill="#8a5a2b" stroke={INK} strokeWidth={8} />
      <rect x={-150} y={-40} width={300} height={40} fill="#8a5a2b" stroke={INK} strokeWidth={8} />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke="#C98A4B" strokeWidth={18} strokeLinecap="round" />
      <circle cx={0} cy={-post} r={26} fill="#FFD43B" stroke={INK} strokeWidth={7} />
      {plate(L, <g transform="scale(1.1)"><Puppet pose={POSES.guard} build="slim" style="hero" /></g>, 'TECHNIQUE')}
      {plate(R, <g transform="scale(1.25)"><Puppet pose={POSES.flex} build="muscle" style="shadow" /></g>, 'FORCE')}
    </g>
  );
};

export const PROPS: Record<string, PropFC> = {
  city: City,
  cage: Cage,
  scale: Scale,
  rulebook: RuleBook,
  tooth: Tooth,
  confetti: Confetti,
  globe: Globe,
  balance: Balance,
};
