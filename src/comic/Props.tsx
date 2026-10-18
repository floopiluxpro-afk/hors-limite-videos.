// Décors et accessoires dessinés en SVG, style BD (contours noirs épais).
import React from 'react';
import {Easing, interpolate, random} from 'remotion';
import {Puppet} from './Puppet';
import {POSES} from './poses';
import type {ComicElement} from './types';
import type {ComicTheme} from './theme';

const INK = '#000';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type PropFC = React.FC<{el: ComicElement; t: number; th: ComicTheme}>;

/** Ville de nuit + montagnes : origine = milieu du sol. */
const City: PropFC = ({t, th}) => {
  const buildings = Array.from({length: 11}, (_, i) => {
    const w = 70 + random(`bw${i}`) * 60;
    const h = 220 + random(`bh${i}`) * 420;
    return {x: -560 + i * 104, w, h};
  });
  const sweep = Math.sin(t * 1.4) * 18;
  return (
    <g>
      <circle cx={300} cy={-860} r={70} fill="#FFF3B0" stroke={th.out} strokeWidth={7} />
      <polygon points="-600,-360 -380,-700 -180,-420 40,-760 260,-430 430,-640 640,-360" fill="#B9A6F2" stroke={th.out} strokeWidth={7} strokeLinejoin="round" />
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
          <rect x={b.x} y={-b.h} width={b.w} height={b.h} fill="#1F1B4D" stroke={th.out} strokeWidth={6} />
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
const Cage: PropFC = ({t, th}) => {
  const oct = (r: number) =>
    Array.from({length: 8}, (_, i) => {
      const a = (Math.PI / 8) * (2 * i + 1);
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    }).join(' ');
  return (
    <g transform={`rotate(${t * 4})`}>
      <polygon points={oct(430)} fill="#2a2a2a" stroke={th.out} strokeWidth={10} />
      <polygon points={oct(395)} fill="none" stroke="#9aa3ad" strokeWidth={34} strokeDasharray="6 10" />
      <polygon points={oct(370)} fill="#E9EEF3" stroke={th.out} strokeWidth={8} />
      <circle r={120} fill="none" stroke="#c8d0d8" strokeWidth={10} />
      <circle r={40} fill="#E8202A" stroke={th.out} strokeWidth={6} />
      {Array.from({length: 8}, (_, i) => {
        const a = (Math.PI / 4) * i;
        return <circle key={i} cx={Math.cos(a) * 430} cy={Math.sin(a) * 430} r={22} fill="#555" stroke={th.out} strokeWidth={6} />;
      })}
    </g>
  );
};

/** Pèse-personne qui casse : origine = milieu du sol. */
const Scale: PropFC = ({el, t, th}) => {
  const k = el.breakAt ?? 1;
  const needle = interpolate(t, [0, k - 0.1, k], [-60, 60, 150], clamp);
  const broken = t >= k;
  const squash = broken ? 0.9 : 1;
  return (
    <g transform={`scale(1 ${squash})`}>
      <rect x={-240} y={-150} width={480} height={150} rx={30} fill="#f2f2f2" stroke={th.out} strokeWidth={9} />
      <circle cx={0} cy={-75} r={58} fill="#fff" stroke={th.out} strokeWidth={7} />
      <line x1={0} y1={-75} x2={Math.sin((needle * Math.PI) / 180) * 48} y2={-75 - Math.cos((needle * Math.PI) / 180) * 48} stroke="#E8202A" strokeWidth={7} strokeLinecap="round" />
      {broken ? (
        <g stroke={th.line} strokeWidth={6} fill="none" strokeLinecap="round">
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
const RuleBook: PropFC = ({el, t, th}) => {
  const k = el.tearAt ?? 1;
  const p = interpolate(t, [k, k + 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const page = (side: 1 | -1) => (
    <g transform={`translate(${side * p * 160} ${p * 80}) rotate(${side * p * 28})`}>
      <rect x={side === 1 ? 0 : -300} y={-210} width={300} height={420} fill="#FFFDF2" stroke={th.out} strokeWidth={9} />
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
        <text x={0} y={-240} textAnchor="middle" fontFamily={th.font} fontWeight={th.weight} fontSize={90} fill="#E8202A" stroke={th.out} strokeWidth={6} paintOrder="stroke">
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
              stroke={th.out}
              strokeWidth={4}
              transform={`rotate(${random(`pr${i}`) * 360 * p})`}
            />
          ))
        : null}
    </g>
  );
};

/** Dent qui s'envole (apparaît à `at`). */
const Tooth: PropFC = ({el, t, th}) => {
  const dt = t - (el.at ?? 0);
  if (dt < 0) return null;
  const x = dt * 520;
  const y = -dt * 700 + dt * dt * 900;
  return (
    <g transform={`translate(${x} ${y}) rotate(${dt * 720})`}>
      <path
        d="M -26 -30 Q -30 -48 -12 -46 Q 0 -40 12 -46 Q 30 -48 26 -30 L 20 10 Q 16 26 8 30 Q 4 10 0 6 Q -4 10 -8 30 Q -16 26 -20 10 Z"
        fill="#fff"
        stroke={th.out}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <line x1={-70} y1={-60} x2={-40} y2={-40} stroke={th.line} strokeWidth={5} />
      <line x1={-80} y1={-20} x2={-45} y2={-15} stroke={th.line} strokeWidth={5} />
    </g>
  );
};

const CONFETTI = ['#E8202A', '#FFE14D', '#2F80ED', '#2DBE6C', '#FF5C9A', '#fff'];
const Confetti: PropFC = ({t, th}) => (
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
          stroke={th.out}
          strokeWidth={3}
          transform={`rotate(${t * 300 + i * 40} ${x + 11} ${y + 17})`}
        />
      );
    })}
  </g>
);

/** Globe terrestre qui tourne, ceinture noire en orbite : origine = centre. */
const Globe: PropFC = ({t, th}) => {
  const r = 300;
  const spin = (t * 60) % 120;
  return (
    <g>
      {th.out !== 'none' ? <circle r={r + 14} fill={INK} /> : null}
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
            stroke={th.out}
            strokeWidth={6}
          />
        ))}
        {[-0.6, 0, 0.6].map((k, i) => (
          <ellipse key={i} rx={r * Math.abs(Math.cos(spin / 40 + k))} ry={r} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={4} />
        ))}
      </g>
      <circle r={r} fill="none" stroke={th.out} strokeWidth={10} />
      <g transform={`rotate(-18)`}>
        <ellipse rx={r * 1.35} ry={r * 0.32} fill="none" stroke={th.line} strokeWidth={34} strokeDasharray={`${r * 2.2} ${r * 10}`} strokeDashoffset={-t * 300} />
      </g>
    </g>
  );
};

/** Balance : la technique (petit pantin blanc) l'emporte sur la force (gros bras noir). Origine = milieu du sol. */
const Balance: PropFC = ({el, t, th}) => {
  const k = el.at ?? 0.5;
  const tilt = interpolate(t, [k - 0.3, k, k + 0.25], [-10, -10, 16], {...clamp, easing: Easing.out(Easing.back(2))});
  const arm = 360;
  const post = 620;
  const a = (tilt * Math.PI) / 180;
  const L = {x: -Math.cos(a) * arm, y: -post - Math.sin(-a) * arm};
  const R = {x: Math.cos(a) * arm, y: -post + Math.sin(-a) * arm};
  const plate = (p: {x: number; y: number}, children: React.ReactNode, label: string) => (
    <g transform={`translate(${p.x} ${p.y})`}>
      <line x1={0} y1={0} x2={-100} y2={200} stroke={th.line} strokeWidth={6} />
      <line x1={0} y1={0} x2={100} y2={200} stroke={th.line} strokeWidth={6} />
      <path d="M -130 200 Q 0 260 130 200 Z" fill="#FFD43B" stroke={th.out} strokeWidth={8} />
      <g transform="translate(0 205)">{children}</g>
      <text x={0} y={330} textAnchor="middle" fontFamily={th.font} fontWeight={th.weight} fontSize={70} fill="#fff" stroke={th.out} strokeWidth={10} paintOrder="stroke">
        {label}
      </text>
    </g>
  );
  return (
    <g>
      <rect x={-20} y={-post} width={40} height={post} fill="#8a5a2b" stroke={th.out} strokeWidth={8} />
      <rect x={-150} y={-40} width={300} height={40} fill="#8a5a2b" stroke={th.out} strokeWidth={8} />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={th.out === 'none' ? '#8a5a2b' : INK} strokeWidth={30} strokeLinecap="round" />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke="#C98A4B" strokeWidth={18} strokeLinecap="round" />
      <circle cx={0} cy={-post} r={26} fill="#FFD43B" stroke={th.out} strokeWidth={7} />
      {plate(L, <g transform="scale(1.1)"><Puppet pose={POSES.guard} build="slim" style="hero" /></g>, 'TECHNIQUE')}
      {plate(R, <g transform="scale(1.25)"><Puppet pose={POSES.flex} build="muscle" style="shadow" /></g>, 'FORCE')}
    </g>
  );
};


/** Couronne dorée (origine = bas de la couronne) ; apparaît à `at`, peut tomber avec "breakAt". */
const Crown: PropFC = ({el, t, th}) => {
  const dt = t - (el.at ?? 0);
  if (dt < 0) return null;
  const appear = interpolate(dt, [0, 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const fall = el.breakAt !== undefined ? Math.max(0, t - el.breakAt) : 0;
  return (
    <g transform={`translate(${fall * 300} ${fall * fall * 2200}) rotate(${fall * 400}) scale(${appear})`}>
      <polygon points="-70,0 70,0 85,-80 40,-35 0,-95 -40,-35 -85,-80" fill="#FFC93C" stroke={th.out} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-72} y={-14} width={144} height={18} fill="#E5A50F" />
      {[-85, 0, 85].map((x, i) => (
        <circle key={i} cx={x} cy={i === 1 ? -95 : -80} r={11} fill="#FF5A5F" stroke={th.out} strokeWidth={5} />
      ))}
    </g>
  );
};

/** Ceinture de champion (origine = centre) ; brille. */
const BeltGold: PropFC = ({t, th}) => {
  const glint = ((t * 0.8) % 1.6) - 0.3;
  return (
    <g>
      <rect x={-260} y={-45} width={520} height={90} rx={30} fill="#1D2133" stroke={th.out} strokeWidth={7} />
      <ellipse rx={130} ry={95} fill="#FFC93C" stroke={th.out} strokeWidth={8} />
      <ellipse rx={95} ry={66} fill="#E5A50F" />
      <circle r={40} fill="#FFC93C" />
      {[-195, 195].map((x) => (
        <rect key={x} x={x - 30} y={-30} width={60} height={60} rx={10} fill="#FFC93C" stroke={th.out} strokeWidth={6} />
      ))}
      <clipPath id="beltClip">
        <ellipse rx={130} ry={95} />
      </clipPath>
      <rect x={glint * 260 - 20} y={-120} width={40} height={240} fill="rgba(255,255,255,0.6)" transform="rotate(20)" clipPath="url(#beltClip)" />
    </g>
  );
};

/** Micro (origine = base du manche). */
const Mic: PropFC = ({th}) => (
  <g>
    <rect x={-12} y={-150} width={24} height={150} rx={10} fill="#3A3F57" stroke={th.out} strokeWidth={6} />
    <circle cx={0} cy={-175} r={42} fill="#9AA3AD" stroke={th.out} strokeWidth={7} />
    <path d="M -30 -190 L 30 -160 M -36 -170 L 26 -140 M -26 -205 L 34 -175" stroke="#6B7380" strokeWidth={5} />
  </g>
);

/** Flashs d'appareils photo qui crépitent dans tout le cadre. */
const Flashes: PropFC = ({t}) => (
  <g>
    {Array.from({length: 18}, (_, i) => {
      const period = 0.5 + random(`fp${i}`) * 0.7;
      const phase = (t + random(`fo${i}`) * period) % period;
      const on = phase < 0.09;
      if (!on) return null;
      const x = random(`fx${i}`) * 1080 - 540;
      const y = -random(`fy${i}`) * 900;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={46} fill="rgba(255,255,255,0.35)" />
          <polygon points="0,-60 12,-12 60,0 12,12 0,60 -12,12 -60,0 -12,-12" fill="#fff" />
        </g>
      );
    })}
  </g>
);

/** Le Nippon Budokan : toit octogonal à pans courbes, bulbe doré (origine = milieu du sol). */
const Budokan: PropFC = ({th}) => (
  <g>
    <rect x={-380} y={-260} width={760} height={260} fill="#E8E8E8" stroke={th.out} strokeWidth={8} />
    {[-300, -150, 0, 150, 300].map((x) => (
      <rect key={x} x={x - 22} y={-240} width={44} height={240} fill="#C9C9C9" stroke={th.out} strokeWidth={5} />
    ))}
    <path d="M -470 -250 Q -260 -300 -200 -420 L 200 -420 Q 260 -300 470 -250 Z" fill="#3A3A3A" stroke={th.out} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -240 -420 Q -120 -470 -80 -560 L 80 -560 Q 120 -470 240 -420 Z" fill="#555" stroke={th.out} strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={0} cy={-600} rx={46} ry={46} fill="#E5B530" stroke={th.out} strokeWidth={7} />
    <line x1={0} y1={-646} x2={0} y2={-690} stroke={th.out} strokeWidth={7} />
  </g>
);

/** Ring de boxe vu de face : poteaux, 3 cordes (origine = milieu du sol). */
const Ring: PropFC = ({th}) => (
  <g>
    <rect x={-560} y={-40} width={1120} height={40} fill="#BBB" stroke={th.out} strokeWidth={6} />
    {[-520, 520].map((x) => (
      <rect key={x} x={x - 16} y={-560} width={32} height={520} fill="#E3001B" stroke={th.out} strokeWidth={6} />
    ))}
    {[-480, -350, -220].map((y) => (
      <line key={y} x1={-520} x2={520} y1={y} y2={y + 6} stroke={th.out === 'none' ? '#fff' : '#fff'} strokeWidth={12} />
    ))}
    {[-480, -350, -220].map((y) => (
      <line key={`o${y}`} x1={-520} x2={520} y1={y - 7} y2={y - 1} stroke={th.out} strokeWidth={3} />
    ))}
  </g>
);

/** Foule : rangées de têtes et d'épaules (origine = bas de la foule). */
const Crowd: PropFC = ({t, th}) => (
  <g>
    {[0, 1, 2, 3].map((row) =>
      Array.from({length: 13}, (_, i) => {
        const x = -600 + i * 95 + (row % 2) * 47;
        const y = -row * 85;
        const bob = Math.sin(t * 6 + i * 1.7 + row) * 6;
        const shade = ['#2B2B2B', '#444', '#5C5C5C', '#777'][row];
        return (
          <g key={`${row}-${i}`} transform={`translate(${x} ${y + bob})`}>
            <path d="M -40 0 Q -40 -55 0 -55 Q 40 -55 40 0 Z" fill={shade} stroke={th.out} strokeWidth={4} />
            <circle cx={0} cy={-78} r={24} fill={shade} stroke={th.out} strokeWidth={4} />
          </g>
        );
      }),
    ).reverse()}
  </g>
);

/** Temples siamois (prangs) : tours à étages et flèches (origine = milieu du sol). */
const Temple: PropFC = ({th}) => {
  const prang = (x: number, h: number, w: number) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <rect x={-w * 0.6} y={-h * 0.25} width={w * 1.2} height={h * 0.25} fill="#BDBDBD" stroke={th.out} strokeWidth={6} />
      {[0, 1, 2, 3, 4].map((i) => {
        const ww = w * (1 - i * 0.17);
        const y = -h * 0.25 - (i + 1) * h * 0.12;
        return <path key={i} d={`M ${-ww / 2} ${y + h * 0.12} Q ${-ww / 2} ${y} 0 ${y - h * 0.03} Q ${ww / 2} ${y} ${ww / 2} ${y + h * 0.12} Z`} fill={i % 2 ? '#D9D9D9' : '#9E9E9E'} stroke={th.out} strokeWidth={5} />;
      })}
      <line x1={0} y1={-h * 0.88} x2={0} y2={-h} stroke={th.out} strokeWidth={8} />
    </g>
  );
  return <g>{[prang(-330, 520, 170), prang(330, 520, 170), prang(0, 760, 240)]}</g>;
};

/** Flammes animées (origine = bas des flammes, largeur ~1100). */
const Flames: PropFC = ({t, th}) => (
  <g>
    {Array.from({length: 14}, (_, i) => {
      const x = -560 + i * 82;
      const h = 220 + random(`fl${i}`) * 260 + Math.sin(t * 9 + i * 1.3) * 50;
      const w = 90 + random(`fw${i}`) * 50;
      return (
        <g key={i}>
          <path d={`M ${x - w / 2} 0 Q ${x - w / 2} ${-h * 0.5} ${x + Math.sin(t * 7 + i) * 20} ${-h} Q ${x + w / 2} ${-h * 0.5} ${x + w / 2} 0 Z`} fill="#E3001B" stroke={th.out} strokeWidth={5} />
          <path d={`M ${x - w / 4} 0 Q ${x - w / 4} ${-h * 0.3} ${x} ${-h * 0.55} Q ${x + w / 4} ${-h * 0.3} ${x + w / 4} 0 Z`} fill="#fff" />
        </g>
      );
    })}
  </g>
);

/** Guirlande de lanternes de fête qui se balancent (origine = point d'accroche gauche, largeur 1100). */
const Lanterns: PropFC = ({t, th}) => (
  <g>
    <path d="M -560 0 Q 0 160 560 0" fill="none" stroke={th.line} strokeWidth={5} />
    {Array.from({length: 7}, (_, i) => {
      const x = -480 + i * 160;
      const y = 160 * (1 - Math.pow((x / 560), 2)) * 0.95;
      const sw = Math.sin(t * 2.5 + i) * 8;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${sw})`}>
          <line x1={0} y1={0} x2={0} y2={30} stroke={th.line} strokeWidth={4} />
          <ellipse cx={0} cy={85} rx={46} ry={58} fill={i % 2 ? '#E3001B' : '#fff'} stroke={th.out} strokeWidth={6} />
          <rect x={-22} y={22} width={44} height={14} fill="#333" />
          <rect x={-22} y={136} width={44} height={14} fill="#333" />
        </g>
      );
    })}
  </g>
);

/** Chaînes qui se brisent à `breakAt` (origine = centre). */
const Chains: PropFC = ({el, t, th}) => {
  const k = el.breakAt ?? 1e9;
  const p = interpolate(t, [k, k + 0.4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const link = (x: number, i: number, side: number) => (
    <ellipse key={`${side}${i}`} cx={x} cy={0} rx={48} ry={26} fill="none" stroke="#7A7A7A" strokeWidth={14} transform={`rotate(${i % 2 ? 0 : 0})`} />
  );
  return (
    <g>
      <g transform={`translate(${-p * 220} ${p * 160}) rotate(${-p * 35})`}>{[-280, -200, -120, -40].map((x, i) => link(x, i, 0))}</g>
      <g transform={`translate(${p * 220} ${p * 160}) rotate(${p * 35})`}>{[40, 120, 200, 280].map((x, i) => link(x, i, 1))}</g>
      {p > 0 && p < 1 ? <polygon points="0,-90 22,-20 90,0 22,20 0,90 -22,20 -90,0 -22,-20" fill="#fff" stroke={th.out} strokeWidth={5} transform={`scale(${1 - p})`} /> : null}
    </g>
  );
};

/** Trône royal (origine = milieu du sol). */
const Throne: PropFC = ({th}) => (
  <g>
    <rect x={-200} y={-140} width={400} height={140} fill="#C9A227" stroke={th.out} strokeWidth={7} />
    <path d="M -170 -140 L -170 -560 Q 0 -700 170 -560 L 170 -140 Z" fill="#E3001B" stroke={th.out} strokeWidth={7} />
    <path d="M -120 -180 L -120 -520 Q 0 -620 120 -520 L 120 -180 Z" fill="none" stroke="#C9A227" strokeWidth={10} />
    <rect x={-240} y={-300} width={70} height={300} fill="#C9A227" stroke={th.out} strokeWidth={7} />
    <rect x={170} y={-300} width={70} height={300} fill="#C9A227" stroke={th.out} strokeWidth={7} />
  </g>
);

/** Anneaux olympiques (origine = centre). Apparaissent un par un à partir de `at`. */
const Rings: PropFC = ({el, t}) => {
  const cols = ['#0085C7', '#222', '#DF0024', '#F4C300', '#009F3D'];
  const pos = [[-230, -50], [0, -50], [230, -50], [-115, 60], [115, 60]];
  return (
    <g>
      {pos.map(([x, y], i) => {
        const k = interpolate(t - (el.at ?? 0) - i * 0.12, [0, 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
        return k > 0 ? <circle key={i} cx={x} cy={y} r={100 * k} fill="none" stroke={cols[i] === '#222' ? '#EEE' : cols[i]} strokeWidth={22} /> : null;
      })}
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
  crown: Crown,
  beltGold: BeltGold,
  mic: Mic,
  flashes: Flashes,
  budokan: Budokan,
  ring: Ring,
  crowd: Crowd,
  temple: Temple,
  flames: Flames,
  lanterns: Lanterns,
  chains: Chains,
  throne: Throne,
  rings: Rings,
};
