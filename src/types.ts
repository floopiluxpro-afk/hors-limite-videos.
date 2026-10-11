export type Word = {text: string; start: number; end: number; line: number};

export type Transition = 'none' | 'cut' | 'jump' | 'whip' | 'zoom' | 'flash';
export type Motion = 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp';

export type Shot = {
  id: string;
  image: string | null;
  start: number;
  end: number;
  motion: Motion;
  variant: number;
  transition: Transition;
  direction: 1 | -1;
  impact: 'soft' | 'hard' | null;
};

export type Overlay = {
  type: 'counter' | 'title' | 'name' | 'stamp' | 'medals' | 'logo';
  start: number;
  end: number;
  text?: string;
  subtitle?: string;
  from?: number;
  to?: number;
  decimals?: number;
  suffix?: string;
  flag?: 'jp' | 'nl' | 'fr' | 'th' | 'br' | 'us';
  color?: 'red' | 'yellow';
  won?: number;
  total?: number;
};

export type Sfx = {src: string; start: number; volume: number};

export type Timeline = {
  slug: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  duration: number;
  durationInFrames: number;
  voice: string | null;
  estimated?: boolean;
  music: string | null;
  musicCuts: {start: number; end: number}[];
  words: Word[];
  shots: Shot[];
  overlays: Overlay[];
  sfx: Sfx[];
};

export type VideoProps = {slug: string; timeline?: Timeline};
