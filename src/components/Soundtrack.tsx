import React, {useMemo} from 'react';
import {Html5Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import type {Timeline} from '../types';

const MUSIC_FULL = 0.3; // musique seule
const MUSIC_DUCKED = 0.1; // musique sous la voix

/** Volume de la musique image par image : baissée quand la voix parle, coupée sur les sections "cut". */
function useMusicVolumes(timeline: Timeline, fps: number) {
  return useMemo(() => {
    const n = timeline.durationInFrames;
    const speaking = new Uint8Array(n);
    for (const w of timeline.words) {
      const a = Math.max(0, Math.floor((w.start - 0.12) * fps));
      const b = Math.min(n - 1, Math.ceil((w.end + 0.3) * fps));
      for (let f = a; f <= b; f++) speaking[f] = 1;
    }
    const vols = new Float32Array(n);
    let v = MUSIC_FULL;
    for (let f = 0; f < n; f++) {
      const t = f / fps;
      const cut = timeline.musicCuts.some((c) => t >= c.start + 0.15 && t < c.end - 0.1);
      const target = cut ? 0 : speaking[f] ? MUSIC_DUCKED : MUSIC_FULL;
      v += (target - v) * (target < v ? 0.35 : 0.12); // descente rapide, remontée douce
      vols[f] = v;
    }
    return vols;
  }, [timeline, fps]);
}

export const Soundtrack: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const {fps} = useVideoConfig();
  const vols = useMusicVolumes(timeline, fps);
  return (
    <>
      {timeline.voice ? <Html5Audio src={staticFile(timeline.voice)} volume={1} /> : null}
      {timeline.music ? (
        <Html5Audio src={staticFile(timeline.music)} volume={(f) => vols[Math.min(f, vols.length - 1)] ?? 0} />
      ) : null}
      {timeline.sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.round(3 * fps)} layout="none">
          <Html5Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};
