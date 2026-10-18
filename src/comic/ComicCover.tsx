// Couverture TikTok d'une vidéo en cases : une case figée à l'instant choisi + gros titre.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '../Video';
import {FlatDefs} from './FlatLettering';
import {COMIC_FONT} from './Lettering';
import {Panel} from './Panel';
import {THEMES, ThemeContext} from './theme';
import type {Comic} from './types';

export type ComicCoverProps = {
  slug: string;
  panel: string; // id de la case
  t?: number; // instant dans la case (s)
  title: string[]; // *ligne* = en jaune et plus grosse
  badge?: string;
  keep?: string[]; // types de lettrage de la case à garder (ex. ["sfx"])
  comic?: Comic;
};

// Zone sûre : la grille du profil recadre en 3:4 au centre (y ≈ 240 à 1680).
export const ComicCover: React.FC<ComicCoverProps> = ({comic, panel: id, t = 0.5, title, badge, keep = ['sfx']}) => {
  useFonts();
  if (!comic) return null;
  const theme = THEMES[comic.theme ?? 'comic'] ?? THEMES.comic;
  const flat = theme.name === 'flat';
  const src = comic.panels.find((p) => p.id === id) ?? comic.panels[0];
  const lettering = new Set(['caption', 'sfx', 'title', 'name', 'timer', 'counter', 'logo', 'bubble']);
  const panel = {...src, fx: [], elements: src.elements.filter((e) => !lettering.has(e.type) || keep.includes(e.type))};
  const font = flat ? 'Montserrat, Arial Black, sans-serif' : COMIC_FONT;
  const weight = flat ? 900 : 400;
  let y = 330;
  return (
    <ThemeContext.Provider value={theme}>
      <AbsoluteFill style={{backgroundColor: '#fff'}}>
        <Panel panel={panel} t={t} frame={0} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <FlatDefs />
          <g filter={flat ? 'url(#fl-shadow)' : undefined}>
            {title.map((line, i) => {
              const hl = /^\*.*\*$/.test(line);
              const text = line.replace(/^\*|\*$/g, '').toUpperCase();
              const size = Math.min(hl ? 190 : 92, 980 / ((flat ? 0.72 : 0.5) * Math.max(4, text.length)));
              y += size * (i === 0 ? 0 : 1.02);
              return (
                <text
                  key={i}
                  x={540}
                  y={y}
                  textAnchor="middle"
                  fontFamily={font}
                  fontWeight={weight}
                  fontSize={size}
                  fill={hl ? (theme.name === 'manga' ? '#E3001B' : '#FFC93C') : '#fff'}
                  stroke={flat ? 'none' : '#000'}
                  strokeWidth={flat ? 0 : size * 0.11}
                  paintOrder="stroke"
                  letterSpacing={flat ? -1 : 0}
                >
                  {text}
                </text>
              );
            })}
          </g>
          {badge ? (
            <g transform="translate(540 1600)" filter={flat ? 'url(#fl-shadow)' : undefined}>
              <rect x={-190} y={-58} width={380} height={104} rx={52} fill={theme.name === 'manga' ? '#E3001B' : '#FF5A5F'} stroke={flat ? 'none' : '#000'} strokeWidth={6} />
              <text x={0} y={18} textAnchor="middle" fontFamily={font} fontWeight={weight} fontSize={56} fill="#fff">
                {badge}
              </text>
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
