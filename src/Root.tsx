import React from 'react';
import {CalculateMetadataFunction, Composition, staticFile} from 'remotion';
import {HorsLimiteVideo} from './Video';
import type {Timeline, VideoProps} from './types';

const calculateMetadata: CalculateMetadataFunction<VideoProps> = async ({props}) => {
  const res = await fetch(staticFile(`${props.slug}/timeline.json`));
  if (!res.ok) throw new Error(`timeline.json introuvable pour "${props.slug}" : lance "npm run timeline -- ${props.slug}"`);
  const timeline = (await res.json()) as Timeline;
  return {
    durationInFrames: timeline.durationInFrames,
    fps: timeline.fps,
    width: timeline.width,
    height: timeline.height,
    props: {...props, timeline},
  };
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HorsLimite"
    component={HorsLimiteVideo}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30 * 50}
    defaultProps={{slug: 'geesink-1964'} as VideoProps}
    calculateMetadata={calculateMetadata}
  />
);
