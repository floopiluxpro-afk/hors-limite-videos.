import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Shot} from '../types';

const WHIP = 0.28; // durée d'un whip pan (s)
const ZOOM_IN = 0.24; // durée d'une transition "zoom" (s)
const ORIGINS = ['50% 45%', '50% 32%', '35% 45%', '65% 40%', '50% 60%'];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const whipEase = Easing.inOut(Easing.cubic);

function kenBurns(shot: Shot, p: number) {
  switch (shot.motion) {
    case 'zoomOut':
      return {scale: 1.22 - 0.15 * p, x: 0, y: 0};
    case 'panLeft':
      return {scale: 1.17, x: 0.045 - 0.09 * p, y: 0};
    case 'panRight':
      return {scale: 1.17, x: -0.045 + 0.09 * p, y: 0};
    case 'panUp':
      return {scale: 1.17, x: 0, y: 0.04 - 0.08 * p};
    case 'zoomIn':
    default:
      return {scale: 1.06 + 0.15 * p, x: 0, y: 0};
  }
}

function impactScale(shot: Shot, dt: number) {
  if (!shot.impact || dt < 0) return 1;
  if (shot.impact === 'hard') {
    return interpolate(dt, [0, 0.1, 0.9], [1, 1.34, 1.2], {...clamp, easing: Easing.out(Easing.cubic)});
  }
  return interpolate(dt, [0, 0.08, 0.6], [1, 1.12, 1.06], {...clamp, easing: Easing.out(Easing.quad)});
}

const ShotLayer: React.FC<{shot: Shot; next?: Shot; t: number; width: number}> = ({shot, next, t, width}) => {
  const dur = shot.end - shot.start;
  const p = interpolate(t, [shot.start, shot.end], [0, 1], clamp);
  const kb = kenBurns(shot, p);
  let scale = kb.scale * impactScale(shot, t - shot.start);
  let tx = kb.x * width;
  const ty = kb.y * width;
  let blurX = 0;
  let blur = 0;

  // Entrée
  if (shot.transition === 'whip') {
    const pin = interpolate(t, [shot.start - WHIP / 2, shot.start + WHIP / 2], [0, 1], {...clamp, easing: whipEase});
    tx += shot.direction * (1 - pin) * width;
    blurX = Math.max(blurX, Math.sin(Math.PI * pin) * 60);
  } else if (shot.transition === 'zoom') {
    const pin = interpolate(t, [shot.start, shot.start + ZOOM_IN], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    scale *= 1 + 0.55 * (1 - pin);
    blur = 18 * (1 - pin);
  }
  // Sortie (whip vers le plan suivant)
  if (next?.transition === 'whip') {
    const pout = interpolate(t, [shot.end - WHIP / 2, shot.end + WHIP / 2], [0, 1], {...clamp, easing: whipEase});
    tx -= next.direction * pout * width;
    blurX = Math.max(blurX, Math.sin(Math.PI * pout) * 60);
  }

  const filterId = `whip-${shot.id.replace(/\W/g, '_')}`;
  const filters = [blurX > 0.5 ? `url(#${filterId})` : '', blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : '']
    .filter(Boolean)
    .join(' ');
  const origin = ORIGINS[shot.variant % ORIGINS.length];
  const variantScale = shot.variant > 0 ? 1.3 : 1;

  return (
    <AbsoluteFill style={{transform: `translateX(${tx}px)`, filter: filters || undefined, overflow: 'hidden'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={filterId} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blurX.toFixed(1)} 0`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translateY(${ty}px) scale(${scale * variantScale})`,
          transformOrigin: origin,
        }}
      >
        {shot.image ? (
          <Img src={staticFile(shot.image)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <Placeholder id={shot.id} dur={dur} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Placeholder: React.FC<{id: string; dur: number}> = ({id, dur}) => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(circle at 50% 40%, #d98a4f, #5a2e1c)',
      color: 'white',
      fontSize: 90,
      fontFamily: 'Anton',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    PLAN {id}
    <div style={{fontSize: 40}}>{dur.toFixed(2)} s</div>
  </AbsoluteFill>
);

export const Shots: React.FC<{shots: Shot[]}> = ({shots}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill>
      {shots.map((shot, i) => {
        const next = shots[i + 1];
        const from = shot.transition === 'whip' ? shot.start - WHIP / 2 : shot.start;
        const to = next?.transition === 'whip' ? shot.end + WHIP / 2 : shot.end;
        if (t < from || t >= to) return null;
        return <ShotLayer key={shot.id} shot={shot} next={next} t={t} width={width} />;
      })}
    </AbsoluteFill>
  );
};
