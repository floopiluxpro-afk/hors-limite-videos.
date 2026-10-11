import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS, SAFE, outline} from '../theme';
import type {Overlay} from '../types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Anim = {dt: number; left: number; frame: number; fps: number};

const Flag: React.FC<{code: NonNullable<Overlay['flag']>; size?: number}> = ({code, size = 90}) => {
  const w = size * 1.5;
  const box: React.CSSProperties = {width: w, height: size, borderRadius: 10, overflow: 'hidden', border: '5px solid #000', flexShrink: 0};
  const stripes = (cols: string[], dir: 'row' | 'column') => (
    <div style={{...box, display: 'flex', flexDirection: dir}}>
      {cols.map((c) => (
        <div key={c} style={{flex: 1, background: c}} />
      ))}
    </div>
  );
  switch (code) {
    case 'jp':
      return (
        <div style={{...box, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: size * 0.55, height: size * 0.55, borderRadius: '50%', background: '#BC002D'}} />
        </div>
      );
    case 'nl':
      return stripes(['#AE1C28', '#FFFFFF', '#21468B'], 'column');
    case 'fr':
      return stripes(['#0055A4', '#FFFFFF', '#EF4135'], 'row');
    case 'th':
      return stripes(['#A51931', '#F4F5F8', '#2D2A4A', '#2D2A4A', '#F4F5F8', '#A51931'], 'column');
    case 'br':
      return stripes(['#009C3B', '#FFDF00', '#009C3B'], 'column');
    case 'us':
    default:
      return stripes(['#B22234', '#FFFFFF', '#B22234', '#FFFFFF', '#3C3B6E'], 'column');
  }
};

const enterExit = ({dt, left, frame, fps}: Anim) => {
  const s = spring({frame: Math.round(dt * fps), fps, config: {damping: 11, stiffness: 180}});
  const out = interpolate(left, [0, 0.18], [0, 1], clamp);
  void frame;
  return {s, out};
};

const Counter: React.FC<{o: Overlay; a: Anim}> = ({o, a}) => {
  const {s, out} = enterExit(a);
  const total = o.end - o.start;
  const p = interpolate(a.dt, [0.05, Math.min(1.1, total * 0.7)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const value = (o.from ?? 0) + ((o.to ?? 0) - (o.from ?? 0)) * p;
  const dec = o.decimals ?? 0;
  const text = value.toFixed(dec).replace('.', ',') + (o.suffix ?? '');
  const done = p >= 1;
  const bump = done ? interpolate(a.dt - Math.min(1.1, total * 0.7), [0, 0.08, 0.2], [1, 1.12, 1], clamp) : 1;
  return (
    <div style={{...centered, top: SAFE.overlayTop + 40, transform: `scale(${s * bump * out}) rotate(-4deg)`}}>
      <div style={{fontFamily: FONTS.title, fontSize: 250, lineHeight: 1, color: COLORS.yellow, textShadow: `${outline(11)}, 0 16px 30px rgba(0,0,0,.6)`}}>
        {text}
      </div>
    </div>
  );
};

const Title: React.FC<{o: Overlay; a: Anim}> = ({o, a}) => {
  const {s, out} = enterExit(a);
  const len = (o.text ?? '').length;
  const size = Math.min(150, 1500 / Math.max(6, len) * 1.25);
  const bar = interpolate(a.dt, [0.05, 0.3], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{...centered, top: SAFE.overlayTop + 60, opacity: out, transform: `scale(${0.6 + 0.4 * s}) rotate(-3deg)`}}>
      <div style={{position: 'relative', display: 'inline-block', padding: '6px 28px'}}>
        <div style={{position: 'absolute', inset: 0, background: COLORS.red, transform: `scaleX(${bar})`, transformOrigin: 'left', borderRadius: 8, boxShadow: '0 14px 30px rgba(0,0,0,.5)'}} />
        <div style={{position: 'relative', fontFamily: FONTS.title, fontSize: size, lineHeight: 1.08, color: COLORS.white, textShadow: outline(7)}}>{o.text}</div>
      </div>
      {o.subtitle ? (
        <div style={{marginTop: 18, fontFamily: FONTS.caption, fontWeight: 800, fontSize: 50, color: COLORS.yellow, textTransform: 'uppercase', textShadow: outline(6)}}>
          {o.subtitle}
        </div>
      ) : null}
    </div>
  );
};

const NameCard: React.FC<{o: Overlay; a: Anim}> = ({o, a}) => {
  const slide = interpolate(a.dt, [0, 0.25], [-1100, 0], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const sub = interpolate(a.dt, [0.15, 0.4], [-900, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const out = interpolate(a.left, [0, 0.2], [1100, 0], clamp);
  return (
    <div style={{position: 'absolute', top: SAFE.overlayTop + 70, left: 60, transform: `translateX(${slide - out}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, background: COLORS.white, padding: '18px 34px 18px 22px', borderRadius: 14, border: '6px solid #000', boxShadow: '0 16px 34px rgba(0,0,0,.55)'}}>
        {o.flag ? <Flag code={o.flag} size={80} /> : null}
        <div style={{fontFamily: FONTS.title, fontSize: 104, lineHeight: 1, color: '#111'}}>{o.text}</div>
      </div>
      {o.subtitle ? (
        <div style={{display: 'inline-block', marginTop: 12, marginLeft: 30, transform: `translateX(${sub}px)`, background: COLORS.red, padding: '8px 22px', borderRadius: 8, border: '5px solid #000'}}>
          <div style={{fontFamily: FONTS.caption, fontWeight: 900, fontSize: 44, color: COLORS.white, textTransform: 'uppercase'}}>{o.subtitle}</div>
        </div>
      ) : null}
    </div>
  );
};

const Stamp: React.FC<{o: Overlay; a: Anim}> = ({o, a}) => {
  const len = (o.text ?? '').length;
  const size = Math.min(230, 1700 / Math.max(5, len) * 1.15);
  const scale = interpolate(a.dt, [0, 0.13], [3, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const out = interpolate(a.left, [0, 0.15], [0, 1], clamp);
  const wobble = a.dt > 0.13 ? Math.sin(a.dt * 40) * Math.exp(-(a.dt - 0.13) * 8) * 4 : 0;
  const color = o.color === 'yellow' ? COLORS.yellow : COLORS.red;
  return (
    <div style={{...centered, top: 560, opacity: out, transform: `scale(${scale}) rotate(${-8 + wobble}deg)`}}>
      <div style={{display: 'inline-block', border: `14px solid ${color}`, borderRadius: 26, padding: '4px 34px', background: 'rgba(255,255,255,.92)', boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
        <div style={{fontFamily: FONTS.title, fontSize: size, lineHeight: 1.05, color}}>{o.text}</div>
      </div>
    </div>
  );
};

const Medals: React.FC<{o: Overlay; a: Anim}> = ({o, a}) => {
  const {out} = enterExit(a);
  const total = o.total ?? 4;
  const won = o.won ?? 0;
  const counted = Math.min(won, Math.floor(a.dt / 0.28));
  return (
    <div style={{...centered, top: SAFE.overlayTop + 40, opacity: out}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 28}}>
        {Array.from({length: total}, (_, i) => {
          const isWon = i < won;
          const pop = spring({frame: Math.round((a.dt - i * 0.28) * a.fps), fps: a.fps, config: {damping: 9, stiffness: 220}});
          return (
            <div
              key={i}
              style={{
                width: 170,
                height: 170,
                borderRadius: '50%',
                transform: `scale(${isWon ? pop : interpolate(a.dt, [won * 0.28, won * 0.28 + 0.2], [0, 1], clamp)})`,
                background: isWon ? 'radial-gradient(circle at 35% 30%, #fff6b0, #f5c518 45%, #b8860b)' : 'rgba(0,0,0,.45)',
                border: isWon ? '8px solid #000' : '8px dashed #fff',
                boxShadow: '0 12px 26px rgba(0,0,0,.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.title,
                fontSize: 90,
                color: isWon ? '#7a5200' : '#fff',
              }}
            >
              {isWon ? '1' : '?'}
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 26, fontFamily: FONTS.title, fontSize: 170, lineHeight: 1, color: COLORS.yellow, textShadow: outline(10)}}>
        {counted} / {total}
      </div>
    </div>
  );
};

const Logo: React.FC<{o: Overlay; a: Anim}> = ({o, a}) => {
  const s = spring({frame: Math.round(a.dt * a.fps), fps: a.fps, config: {damping: 10, stiffness: 150}});
  const btn = spring({frame: Math.round((a.dt - 0.35) * a.fps), fps: a.fps, config: {damping: 9}});
  const pulse = 1 + Math.max(0, Math.sin((a.dt - 0.6) * 7)) * 0.06 * (a.dt > 0.6 ? 1 : 0);
  const [first, ...rest] = (o.text ?? 'HORS LIMITE').split(' ');
  return (
    <div style={{...centered, top: SAFE.overlayTop + 60}}>
      <div style={{transform: `scale(${s}) rotate(-4deg)`, fontFamily: FONTS.title, fontSize: 210, lineHeight: 0.95, textShadow: `${outline(12)}, 0 18px 40px rgba(0,0,0,.7)`}}>
        <span style={{color: COLORS.white}}>{first}</span> <span style={{color: COLORS.yellow}}>{rest.join(' ')}</span>
      </div>
      {o.subtitle ? (
        <div style={{display: 'inline-block', marginTop: 46, transform: `scale(${btn * pulse})`, background: COLORS.red, border: '7px solid #000', borderRadius: 60, padding: '18px 56px', boxShadow: '0 14px 30px rgba(0,0,0,.55)'}}>
          <div style={{fontFamily: FONTS.caption, fontWeight: 900, fontSize: 64, color: COLORS.white}}>{o.subtitle}</div>
        </div>
      ) : null}
    </div>
  );
};

const centered: React.CSSProperties = {position: 'absolute', left: 40, right: 40, textAlign: 'center'};

const COMPONENTS: Record<Overlay['type'], React.FC<{o: Overlay; a: Anim}>> = {
  counter: Counter,
  title: Title,
  name: NameCard,
  stamp: Stamp,
  medals: Medals,
  logo: Logo,
};

export const Overlays: React.FC<{overlays: Overlay[]}> = ({overlays}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      {overlays.map((o, i) => {
        if (t < o.start || t >= o.end) return null;
        const C = COMPONENTS[o.type];
        return C ? <C key={i} o={o} a={{dt: t - o.start, left: o.end - t, frame, fps}} /> : null;
      })}
    </>
  );
};
