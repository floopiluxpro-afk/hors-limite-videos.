// Échantillons de designs : la même scène (coup de pied + titre + onomatopée + sous-titres)
// dessinée dans plusieurs styles, pour choisir avant de produire une vidéo.
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {Puppet} from './Puppet';
import {POSES} from './poses';
import {THEMES, ThemeContext} from './theme';

export type SampleStyle = 'grec' | 'neon' | 'ombres' | 'sepia';

const W = 1080;
const H = 1920;
const FLOOR = 1290;
const MONT = 'Montserrat, Arial Black, sans-serif';
const CINZEL = 'Cinzel, Georgia, serif';

/** Deux combattants : l'un donne un coup de pied, l'autre est en garde. */
const Fighters: React.FC<{a: string; b: string; filter?: string; aGlove?: string; bGlove?: string}> = ({a, b, filter, aGlove, bGlove}) => (
  <g filter={filter}>
    <g transform={`translate(330 ${FLOOR}) scale(3.6)`}>
      <Puppet pose={POSES.kick} build="tall" style="shadow" tint={a} gloves={aGlove} />
    </g>
    <g transform={`translate(780 ${FLOOR}) scale(-3.6 3.6)`}>
      <Puppet pose={POSES.guard} build="normal" style="shadow" tint={b} gloves={bGlove} />
    </g>
  </g>
);

/** Sous-titres façon vidéo (un mot en jaune). */
const Subs: React.FC<{y?: number}> = ({y = 1420}) => (
  <g fontFamily={MONT} fontWeight={900} fontSize={88} textAnchor="middle" stroke="#000" strokeWidth={16} strokeLinejoin="round" paintOrder="stroke">
    <text x={540} y={y}>
      <tspan fill="#fff">UN COUP DE </tspan>
      <tspan fill="#FFE21A">PIED</tspan>
    </text>
  </g>
);

const Grec: React.FC = () => {
  // frise à méandres (clé grecque)
  const meander = (y: number) => (
    <g>
      <rect x={0} y={y} width={W} height={90} fill="#1A110B" />
      {Array.from({length: 14}, (_, i) => (
        <path
          key={i}
          transform={`translate(${i * 80 + 5} ${y + 15})`}
          d="M0 60 V0 H60 V45 H20 V20 H40"
          fill="none"
          stroke="#D9773A"
          strokeWidth={9}
        />
      ))}
    </g>
  );
  return (
    <svg width={W} height={H}>
      <defs>
        <radialGradient id="terre" cx="0.5" cy="0.45" r="0.8">
          <stop offset="0" stopColor="#E3874A" />
          <stop offset="1" stopColor="#A9471D" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#terre)" />
      {meander(120)}
      <rect x={0} y={FLOOR} width={W} height={18} fill="#1A110B" />
      {meander(FLOOR + 40)}
      <rect x={0} y={FLOOR + 130} width={W} height={H} fill="#1A110B" />
      <Fighters a="#1A110B" b="#1A110B" />
      {/* incisions blanches façon céramique */}
      <text x={540} y={340} textAnchor="middle" fontFamily={CINZEL} fontWeight={900} fontSize={76} fill="#1A110B">
        OLYMPIE, 564 AV. J.-C.
      </text>
      <text x={820} y={560} textAnchor="middle" fontFamily={CINZEL} fontWeight={900} fontSize={120} fill="#F3E2C8" stroke="#1A110B" strokeWidth={10} paintOrder="stroke" transform="rotate(-6 820 560)">
        KRAK !
      </text>
      <Subs y={1560} />
    </svg>
  );
};

const Neon: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="14" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="nuit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#07051A" />
        <stop offset="0.65" stopColor="#1B0B3A" />
        <stop offset="1" stopColor="#07051A" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#nuit)" />
    {/* sol en grille, perspective */}
    <g stroke="#FF2E9A" strokeWidth={3} opacity={0.6} filter="url(#glow)">
      {Array.from({length: 9}, (_, i) => (
        <line key={`h${i}`} x1={0} x2={W} y1={FLOOR + Math.pow(i, 1.7) * 14} y2={FLOOR + Math.pow(i, 1.7) * 14} />
      ))}
      {Array.from({length: 15}, (_, i) => (
        <line key={`v${i}`} x1={540} y1={FLOOR} x2={540 + (i - 7) * 260} y2={H} />
      ))}
    </g>
    <Fighters a="#21E6FF" b="#FF2E9A" filter="url(#glow)" />
    <text x={540} y={330} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={110} fill="none" stroke="#21E6FF" strokeWidth={5} filter="url(#glow)">
      UFC 194
    </text>
    <text x={810} y={560} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={120} fill="#FFF7A8" filter="url(#glow)" transform="rotate(-6 810 560)">
      BAM !
    </text>
    <Subs />
  </svg>
);

const Ombres: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2B1B5A" />
        <stop offset="0.45" stopColor="#C2366B" />
        <stop offset="0.75" stopColor="#FF8A3D" />
        <stop offset="1" stopColor="#FFD27A" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#ciel)" />
    <circle cx={540} cy={820} r={330} fill="#FFE3A3" opacity={0.95} />
    <path d={`M0 ${FLOOR - 40} Q 270 ${FLOOR - 110} 540 ${FLOOR - 30} T ${W} ${FLOOR - 60} V ${H} H 0 Z`} fill="#120A1C" />
    <Fighters a="#120A1C" b="#120A1C" />
    <text x={540} y={300} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={86} fill="#fff" letterSpacing={6}>
      TOKYO, 1976
    </text>
    <text x={810} y={540} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={110} fill="#120A1C" transform="rotate(-6 810 540)">
      BAM !
    </text>
    <Subs />
  </svg>
);

const Sepia: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.35" />
        </feComponentTransfer>
      </filter>
      <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
        <stop offset="1" stopColor="rgba(40,20,5,0.75)" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="#D8C29A" />
    <rect x={0} y={FLOOR} width={W} height={H} fill="#B79E73" />
    <Fighters a="#3A2614" b="#3A2614" />
    {/* carton de film muet */}
    <g transform="translate(540 330)">
      <rect x={-420} y={-110} width={840} height={200} fill="#1E140A" />
      <rect x={-400} y={-90} width={800} height={160} fill="none" stroke="#D8C29A" strokeWidth={4} />
      <text x={0} y={18} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={70} fill="#EFE2C6">
        STOCKHOLM, 1912
      </text>
    </g>
    <text x={810} y={600} textAnchor="middle" fontFamily={CINZEL} fontWeight={900} fontSize={110} fill="#1E140A" transform="rotate(-5 810 600)">
      BAM !
    </text>
    {[180, 470, 760, 905].map((x, i) => (
      <line key={i} x1={x} y1={0} x2={x + (i % 2 ? 12 : -8)} y2={H} stroke="rgba(255,250,235,0.35)" strokeWidth={i % 2 ? 2 : 3} />
    ))}
    <rect width={W} height={H} filter="url(#grain)" />
    <rect width={W} height={H} fill="url(#vignette)" />
    <Subs />
  </svg>
);

export const StyleSample: React.FC<{style: SampleStyle}> = ({style}) => {
  const [handle] = useState(() => delayRender('polices'));
  useEffect(() => {
    Promise.all([document.fonts.load(`900 100px ${MONT}`), document.fonts.load(`900 100px ${CINZEL}`), document.fonts.load(`700 100px ${CINZEL}`)]).finally(() =>
      continueRender(handle),
    );
  }, [handle]);
  const S = {grec: Grec, neon: Neon, ombres: Ombres, sepia: Sepia}[style];
  return (
    <ThemeContext.Provider value={THEMES.flat}>
      <AbsoluteFill>
        <S />
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
