import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {Shots} from './components/Shots';
import {Captions} from './components/Captions';
import {Overlays} from './components/Overlays';
import {Soundtrack} from './components/Soundtrack';
import {Effects} from './components/Effects';
import {FONTS} from './theme';
import type {VideoProps} from './types';

const useFonts = () => {
  const [handle] = useState(() => delayRender('Chargement des polices'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 100px ${FONTS.title}`),
      document.fonts.load(`900 100px ${FONTS.caption}`),
      document.fonts.load(`800 100px ${FONTS.caption}`),
    ]).finally(() => continueRender(handle));
  }, [handle]);
};

export const HorsLimiteVideo: React.FC<VideoProps> = ({timeline}) => {
  useFonts();
  if (!timeline) return null;
  return (
    <AbsoluteFill style={{backgroundColor: '#111'}}>
      <Effects timeline={timeline}>
        <Shots shots={timeline.shots} />
      </Effects>
      <Overlays overlays={timeline.overlays} />
      <Captions words={timeline.words} />
      <Soundtrack timeline={timeline} />
    </AbsoluteFill>
  );
};
