// Échantillons de designs : la même scène (coup de pied + titre + onomatopée + sous-titres)
// dessinée dans plusieurs styles, pour choisir avant de produire une vidéo.
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/press-start-2p/400.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {Puppet} from './Puppet';
import {POSES} from './poses';
import {THEMES, ThemeContext} from './theme';

export type SampleStyle = 'grec' | 'neon' | 'ombres' | 'sepia' | 'manga' | 'papier' | 'pixel' | 'craie';

const W = 1080;
const H = 1920;
const FLOOR = 1290;
const MONT = 'Montserrat, Arial Black, sans-serif';
const CINZEL = 'Cinzel, Georgia, serif';
const MARKER = '"Permanent Marker", cursive';
const PIXEL = '"Press Start 2P", monospace';

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


/** Manga : encre noire sur papier blanc, lignes de vitesse, trames, accent rouge. */
const Manga: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <pattern id="trame" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx={7} cy={7} r={3.2} fill="#000" />
      </pattern>
    </defs>
    <rect width={W} height={H} fill="#fff" />
    {Array.from({length: 90}, (_, i) => {
      const a = (i / 90) * Math.PI * 2;
      const r0 = 330 + ((i * 37) % 7) * 25;
      return <line key={i} x1={600 + Math.cos(a) * r0} y1={800 + Math.sin(a) * r0} x2={600 + Math.cos(a) * 1500} y2={800 + Math.sin(a) * 1500} stroke="#000" strokeWidth={2 + (i % 4)} />;
    })}
    <rect x={0} y={FLOOR} width={W} height={H} fill="url(#trame)" opacity={0.5} />
    <line x1={0} x2={W} y1={FLOOR} y2={FLOOR} stroke="#000" strokeWidth={8} />
    <ThemeContext.Provider value={THEMES.comic}>
      <g transform={`translate(330 ${FLOOR}) scale(3.6)`}>
        <Puppet pose={POSES.kick} build="tall" style="shadow" />
      </g>
      <g transform={`translate(780 ${FLOOR}) scale(-3.6 3.6)`}>
        <Puppet pose={POSES.guard} build="slim" style="hero" />
      </g>
    </ThemeContext.Provider>
    <rect x={20} y={20} width={W - 40} height={H - 40} fill="none" stroke="#000" strokeWidth={14} />
    <g transform="translate(540 300) rotate(-4)">
      <rect x={-330} y={-80} width={660} height={120} fill="#fff" stroke="#000" strokeWidth={8} />
      <text x={0} y={10} textAnchor="middle" fontFamily="Bangers, Impact" fontSize={96} fill="#000">TOKYO, 1976</text>
    </g>
    <text x={820} y={560} textAnchor="middle" fontFamily="Bangers, Impact" fontStyle="italic" fontSize={170} fill="#E3001B" stroke="#000" strokeWidth={10} paintOrder="stroke" transform="rotate(-10 820 560)">DON !</text>
    <Subs />
  </svg>
);

/** Papier découpé : fond kraft, personnages en papier coloré bordé de blanc, ombre portée. */
const Papier: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <filter id="kraft">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="3" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.24  0 0 0 0 0.12  0 0 0 0.25 0" />
      </filter>
      <filter id="decoupe" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d" />
        <feFlood floodColor="#FFFDF5" />
        <feComposite in2="d" operator="in" result="bord" />
        <feOffset in="d" dx="10" dy="14" result="o" />
        <feFlood floodColor="rgba(60,35,10,0.45)" />
        <feComposite in2="o" operator="in" result="ombre" />
        <feMerge>
          <feMergeNode in="ombre" />
          <feMergeNode in="bord" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width={W} height={H} fill="#C9A27A" />
    <rect width={W} height={H} filter="url(#kraft)" />
    <circle cx={800} cy={520} r={190} fill="#F2C14E" filter="url(#decoupe)" />
    <path d={`M0 ${FLOOR} L 120 ${FLOOR - 18} L 260 ${FLOOR + 6} L 420 ${FLOOR - 14} L 600 ${FLOOR + 4} L 780 ${FLOOR - 16} L ${W} ${FLOOR} V ${H} H 0 Z`} fill="#5B8C5A" filter="url(#decoupe)" />
    <g filter="url(#decoupe)">
      <g transform={`translate(330 ${FLOOR}) scale(3.6)`}>
        <Puppet pose={POSES.kick} build="tall" style="shadow" tint="#D2423A" gloves="#333" />
      </g>
      <g transform={`translate(780 ${FLOOR}) scale(-3.6 3.6)`}>
        <Puppet pose={POSES.guard} build="normal" style="shadow" tint="#2F5D9E" gloves="#333" />
      </g>
    </g>
    <g transform="translate(540 300) rotate(-3)" filter="url(#decoupe)">
      <rect x={-360} y={-85} width={720} height={130} fill="#FFFDF5" />
      <text x={0} y={10} textAnchor="middle" fontFamily={MARKER} fontSize={84} fill="#2B2018">TOKYO, 1976</text>
    </g>
    <text x={830} y={760} textAnchor="middle" fontFamily={MARKER} fontSize={120} fill="#2B2018" transform="rotate(-8 830 760)">BAM !</text>
    <Subs />
  </svg>
);

/** Pixel art rétro (jeu vidéo 16 bits) : tout est pixelisé, typo d'arcade, barres de vie. */
const Pixel: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <filter id="pixels" x="0" y="0" width="100%" height="100%">
        <feFlood x="7" y="7" height="4" width="4" />
        <feComposite width="18" height="18" />
        <feTile result="grille" />
        <feComposite in="SourceGraphic" in2="grille" operator="in" />
        <feMorphology operator="dilate" radius="9" />
      </filter>
    </defs>
    <g filter="url(#pixels)">
      <rect width={W} height={FLOOR} fill="#3B2C85" />
      {[[120, 300], [900, 220], [500, 420], [260, 620], [800, 700]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={18} height={18} fill="#FFE66D" />
      ))}
      <rect x={0} y={760} width={W} height={FLOOR - 760} fill="#5A47B8" />
      <rect x={0} y={FLOOR} width={W} height={H} fill="#2E8B57" />
      <rect x={0} y={FLOOR} width={W} height={40} fill="#46C27A" />
      <g transform={`translate(330 ${FLOOR}) scale(3.6)`}>
        <Puppet pose={POSES.kick} build="tall" style="shadow" tint="#E8434C" gloves="#222" />
      </g>
      <g transform={`translate(780 ${FLOOR}) scale(-3.6 3.6)`}>
        <Puppet pose={POSES.guard} build="normal" style="shadow" tint="#2FB3E8" gloves="#222" />
      </g>
    </g>
    {/* barres de vie */}
    {[[60, '#E8434C', 0.9], [580, '#2FB3E8', 0.35]].map(([x, c, v], i) => (
      <g key={i} transform={`translate(${x} 140)`}>
        <rect width={440} height={44} fill="#000" />
        <rect x={6} y={6} width={428 * (v as number)} height={32} fill={c as string} />
      </g>
    ))}
    <text x={540} y={290} textAnchor="middle" fontFamily={PIXEL} fontSize={54} fill="#FFE66D" stroke="#000" strokeWidth={8} paintOrder="stroke">ROUND 1</text>
    <text x={810} y={560} textAnchor="middle" fontFamily={PIXEL} fontSize={74} fill="#fff" stroke="#000" strokeWidth={10} paintOrder="stroke">K.O.!</text>
    <Subs />
  </svg>
);

/** Craie sur tableau noir : traits blancs irréguliers, schéma de coach, typo manuscrite. */
const Craie: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <filter id="craie" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d" />
        <feComponentTransfer in="n" result="trous">
          <feFuncA type="discrete" tableValues="0 1 1 1 1" />
        </feComponentTransfer>
        <feComposite in="d" in2="trous" operator="in" />
      </filter>
      <filter id="ardoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="2" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
      </filter>
    </defs>
    <rect width={W} height={H} fill="#24392F" />
    <rect width={W} height={H} filter="url(#ardoise)" />
    <rect x={14} y={14} width={W - 28} height={H - 28} fill="none" stroke="#8B5A2B" strokeWidth={28} />
    <g filter="url(#craie)" opacity={0.92}>
      <line x1={60} x2={W - 60} y1={FLOOR} y2={FLOOR} stroke="#F4F1E8" strokeWidth={8} />
      <g transform={`translate(330 ${FLOOR}) scale(3.6)`}>
        <Puppet pose={POSES.kick} build="tall" style="shadow" tint="#F4F1E8" gloves="#F4F1E8" />
      </g>
      <g transform={`translate(780 ${FLOOR}) scale(-3.6 3.6)`}>
        <Puppet pose={POSES.guard} build="normal" style="shadow" tint="#F7D35B" gloves="#F7D35B" />
      </g>
      <path d="M 560 520 Q 700 400 760 520" fill="none" stroke="#F47C7C" strokeWidth={10} />
      <path d="M 745 495 L 762 525 L 728 522" fill="none" stroke="#F47C7C" strokeWidth={10} />
      <text x={540} y={300} textAnchor="middle" fontFamily={MARKER} fontSize={90} fill="#F4F1E8">TOKYO, 1976</text>
      <text x={850} y={420} textAnchor="middle" fontFamily={MARKER} fontSize={100} fill="#F47C7C" transform="rotate(-8 850 420)">BAM !</text>
    </g>
    <Subs />
  </svg>
);

export const StyleSample: React.FC<{style: SampleStyle}> = ({style}) => {
  const [handle] = useState(() => delayRender('polices'));
  useEffect(() => {
    Promise.all([document.fonts.load(`400 100px ${MARKER}`), document.fonts.load(`400 50px ${PIXEL}`), document.fonts.load('400 100px Bangers'), document.fonts.load(`900 100px ${MONT}`), document.fonts.load(`900 100px ${CINZEL}`), document.fonts.load(`700 100px ${CINZEL}`)]).finally(() =>
      continueRender(handle),
    );
  }, [handle]);
  const S = {grec: Grec, neon: Neon, ombres: Ombres, sepia: Sepia, manga: Manga, papier: Papier, pixel: Pixel, craie: Craie}[style];
  return (
    <ThemeContext.Provider value={THEMES.flat}>
      <AbsoluteFill>
        <S />
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
