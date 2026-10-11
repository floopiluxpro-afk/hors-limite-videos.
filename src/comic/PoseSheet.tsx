import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Puppet} from './Puppet';
import {POSES} from './poses';

/** Planche de contrôle de toutes les poses (npx remotion still PoseSheet). */
export const PoseSheet: React.FC = () => {
  const names = Object.keys(POSES);
  return (
    <AbsoluteFill style={{background: '#F6D743'}}>
      <svg width={1080} height={1920}>
        {names.map((n, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 140 + col * 260;
          const y = 300 + row * 330;
          return (
            <g key={n}>
              <g transform={`translate(${x - 40},${y}) scale(1.05)`}>
                <Puppet pose={POSES[n]} build="normal" style="shadow" glove={n === 'punch'} />
              </g>
              <g transform={`translate(${x + 40},${y}) scale(0.95)`}>
                <Puppet pose={POSES[n]} build="slim" style="hero" />
              </g>
              <text x={x} y={y + 40} textAnchor="middle" fontSize={30} fontFamily="Arial" fontWeight={700}>
                {n}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
