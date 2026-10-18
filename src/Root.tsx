import React from 'react';
import {CalculateMetadataFunction, Composition, staticFile} from 'remotion';
import {HorsLimiteVideo} from './Video';
import {Cover, CoverProps} from './Cover';
import {PoseSheet} from './comic/PoseSheet';
import {StyleSample} from './comic/StyleSamples';
import {ComicVideo} from './comic/ComicVideo';
import {ComicCover, ComicCoverProps} from './comic/ComicCover';
import type {Comic, ComicProps} from './comic/types';

const comicMetadata: CalculateMetadataFunction<ComicProps> = async ({props}) => {
  const res = await fetch(staticFile(`${props.slug}/comic.json`));
  if (!res.ok) throw new Error(`comic.json introuvable pour "${props.slug}" : lance "npm run comic -- ${props.slug}"`);
  const comic = (await res.json()) as Comic;
  return {durationInFrames: comic.durationInFrames, fps: comic.fps, width: comic.width, height: comic.height, props: {...props, comic}};
};
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
  <>
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
    {/* Couverture TikTok (image fixe) : props issues de "cover" dans le storyboard. */}
    <Composition
      id="Cover"
      component={Cover}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1}
      defaultProps={{image: 'geesink-1964/images/01a.jpg', title: ['Un géant a fait', '*pleurer*', 'tout le Japon'], badge: '1964'} as CoverProps}
    />
    {/* Vidéo au format BD (storyboard "format": "comic") */}
    <Composition
      id="Comic"
      component={ComicVideo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={30 * 50}
      defaultProps={{slug: 'royce-gracie-ufc-1'} as ComicProps}
      calculateMetadata={comicMetadata}
    />
    {/* Couverture d'une vidéo en cases */}
    <Composition
      id="ComicCover"
      component={ComicCover}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1}
      defaultProps={{slug: 'mcgregor-aldo-13-secondes', panel: '00b', title: ['13 secondes'], t: 0.3} as ComicCoverProps}
      calculateMetadata={async ({props}) => {
        const res = await fetch(staticFile(`${props.slug}/comic.json`));
        return {props: {...props, comic: (await res.json()) as Comic}};
      }}
    />
    <Composition id="StyleSample" component={StyleSample} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{style: 'grec' as const}} />
    <Composition id="PoseSheet" component={PoseSheet} width={1080} height={1920} fps={30} durationInFrames={1} />
  </>
);
