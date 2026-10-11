// Composition "Comic" : enchaîne les cases (transitions BD), sous-titres mot par mot et bande son.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../components/Captions';
import {Soundtrack} from '../components/Soundtrack';
import {useFonts} from '../Video';
import {Panel, STAGE} from './Panel';
import type {ComicPanel, ComicProps} from './types';
import type {Timeline} from '../types';

const T = 0.22; // durée des transitions (s)
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Transformation d'entrée d'une case selon sa transition. */
function enter(panel: ComicPanel, t: number, index: number) {
  const tr = index === 0 ? 'cut' : panel.transition ?? 'slam';
  const p = interpolate(t, [0, T], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  if (tr === 'slide') {
    const dir = index % 2 ? 1 : -1;
    return {transform: `translateX(${dir * (1 - p) * 1100}px) rotate(${dir * (1 - p) * 6}deg)`, flash: 0};
  }
  if (tr === 'slam') {
    return {transform: `scale(${1 + (1 - p) * 0.22}) rotate(${(1 - p) * -4}deg)`, flash: (1 - p) * 0.35};
  }
  if (tr === 'flash') return {transform: 'none', flash: interpolate(t, [0, 0.22], [0.95, 0], clamp)};
  return {transform: 'none', flash: 0};
}

export const ComicVideo: React.FC<ComicProps> = ({comic}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!comic) return null;
  const now = frame / fps;
  const idx = comic.panels.findIndex((p) => now >= p.start && now < p.end);
  const cur = idx >= 0 ? idx : comic.panels.length - 1;
  const panel = comic.panels[cur];
  const prev = comic.panels[cur - 1];
  const t = now - panel.start;
  const e = enter(panel, t, cur);
  const showPrev = prev && t < T && panel.transition !== 'flash' && panel.transition !== 'cut';

  return (
    <AbsoluteFill style={{backgroundColor: '#fff'}}>
      {showPrev ? (
        <AbsoluteFill>
          <Panel panel={prev} t={now - prev.start} frame={frame} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{transform: e.transform}}>
        <Panel panel={panel} t={t} frame={frame} />
      </AbsoluteFill>
      {e.flash > 0.01 ? <AbsoluteFill style={{backgroundColor: '#fff', opacity: e.flash}} /> : null}
      <Captions words={comic.words} top={STAGE.floor + 45} />
      <Soundtrack timeline={comic as unknown as Timeline} />
    </AbsoluteFill>
  );
};
