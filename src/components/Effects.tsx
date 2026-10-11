import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Timeline} from '../types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Tremblement de caméra sur les impacts + flashs blancs + vignettage. */
export const Effects: React.FC<{timeline: Timeline; children: React.ReactNode}> = ({timeline, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  let shake = 0;
  let flash = 0;
  for (const s of timeline.shots) {
    const dt = t - s.start;
    if (s.impact && dt >= 0 && dt < 1.2) {
      const amp = s.impact === 'hard' ? 34 : 12;
      const k = s.impact === 'hard' ? 5 : 11;
      shake = Math.max(shake, amp * Math.exp(-dt * k));
    }
    if (s.transition === 'flash' || s.impact === 'hard') {
      const f = interpolate(dt, [-1 / fps, 0, s.impact === 'hard' ? 0.4 : 0.27], [0, 0.95, 0], clamp);
      flash = Math.max(flash, f);
    } else if (s.transition === 'zoom') {
      flash = Math.max(flash, interpolate(dt, [0, 0.15], [0.35, 0], clamp));
    }
  }
  const sx = (random(`x${frame}`) * 2 - 1) * shake;
  const sy = (random(`y${frame}`) * 2 - 1) * shake;
  const rot = (random(`r${frame}`) * 2 - 1) * shake * 0.04;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) rotate(${rot}deg) scale(${shake ? 1.04 : 1})`}}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}}
      />
      {flash > 0.01 ? <AbsoluteFill style={{backgroundColor: 'white', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};
