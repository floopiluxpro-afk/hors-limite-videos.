import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS, SAFE, outline} from '../theme';
import type {Word} from '../types';

const MAX_WORDS = 3;
const MAX_CHARS = 18;

type Page = {words: Word[]; start: number; end: number};

/** Regroupe les mots en "pages" de 1 à 3 mots, coupées à la ponctuation. */
export function paginate(words: Word[]): Page[] {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
    cur = [];
  };
  words.forEach((w, i) => {
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
    const prev = words[i - 1];
    if (cur.length >= MAX_WORDS || (cur.length && chars > MAX_CHARS) || (prev && w.start - prev.end > 0.45)) flush();
    cur.push(w);
    if (/[.,!?:;…]$/.test(w.text)) flush();
  });
  flush();
  // Chaque page reste affichée jusqu'à la suivante (sauf longue pause).
  return pages.map((p, i) => {
    const next = pages[i + 1];
    const end = next && next.start - p.end < 0.6 ? next.start : p.end + 0.35;
    return {...p, start: p.start - 0.04, end};
  });
}

export const Captions: React.FC<{words: Word[]; top?: number}> = ({words, top = SAFE.captionTop}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pages = useMemo(() => paginate(words), [words]);
  const page = pages.find((p) => t >= p.start && t < p.end);
  if (!page) return null;

  const pin = interpolate(t - page.start, [0, 0.1], [0.82, 1], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: SAFE.sidePadding,
        right: SAFE.sidePadding,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        columnGap: 46,
        rowGap: 4,
        transform: `scale(${pin})`,
      }}
    >
      {page.words.map((w, i) => {
        const nextStart = page.words[i + 1]?.start ?? page.end;
        const active = t >= w.start - 0.03 && t < nextStart;
        const pop = active ? interpolate(t - w.start, [0, 0.07, 0.18], [1, 1.08, 1.04], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
        return (
          <span
            key={`${w.start}-${i}`}
            style={{
              fontFamily: FONTS.caption,
              fontWeight: 900,
              fontSize: 92,
              lineHeight: 1.12,
              textTransform: 'uppercase',
              color: active ? COLORS.yellow : COLORS.white,
              textShadow: `${outline(8)}, 0 10px 18px rgba(0,0,0,0.55)`,
              transform: `scale(${pop})`,
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
