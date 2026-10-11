import type {PoseKey} from './poses';
import type {Sfx, Word} from '../types';

export type ComicElement = {
  type: 'puppet' | 'prop' | 'caption' | 'sfx' | 'title' | 'name' | 'timer' | 'counter' | 'logo' | 'inset';
  at?: number;
  x?: number;
  y?: number;
  s?: number;
  rot?: number;
  // pantin
  style?: 'hero' | 'shadow';
  build?: string;
  facing?: 1 | -1;
  poses?: PoseKey[];
  cycle?: {poses: string[]; every: number; from: number; until: number | null};
  move?: {to: [number, number]; at: number; dur: number};
  glove?: boolean;
  sepia?: boolean;
  // décor
  name?: string;
  breakAt?: number;
  tearAt?: number;
  // lettrage
  text?: string;
  subtitle?: string;
  color?: 'yellow' | 'red' | 'white';
  size?: number;
  flag?: string;
  from?: number;
  to?: number;
  prefix?: string;
  suffix?: string;
  // case incrustée
  w?: number;
  h?: number;
  bg?: string;
  elements?: ComicElement[];
};

export type ComicPanel = {
  id: string;
  line: number;
  start: number;
  end: number;
  bg: string;
  rays?: boolean;
  floor?: string | null;
  transition?: 'slam' | 'slide' | 'flash' | 'cut';
  camera?: {zoom: [number, number]; focus: [number, number]};
  elements: ComicElement[];
  fx: {type: 'punch' | 'shake' | 'flash'; at: number}[];
};

export type Comic = {
  slug: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  duration: number;
  durationInFrames: number;
  voice: string | null;
  music: string | null;
  musicCuts: {start: number; end: number}[];
  words: Word[];
  panels: ComicPanel[];
  sfx: Sfx[];
};

export type ComicProps = {slug: string; comic?: Comic};
