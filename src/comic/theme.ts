// Thèmes graphiques du moteur de cases : "comic" (BD, contours noirs, trame) ou "flat" (flat design, sans contour).
import {createContext, useContext} from 'react';

export type ComicTheme = {
  name: 'comic' | 'flat';
  out: string; // couleur des contours ('none' en flat)
  line: string; // traits de détail (lignes de texte, fissures…)
  font: string; // police du lettrage
  weight: number;
  shadow: string; // personnages "adversaires"
  shadowBack: string;
  hero: string;
  heroBack: string;
};

export const THEMES: Record<string, ComicTheme> = {
  comic: {
    name: 'comic',
    out: '#000',
    line: '#000',
    font: 'Bangers, Impact, sans-serif',
    weight: 400,
    shadow: '#0b0b0b',
    shadowBack: '#2a2a2a',
    hero: '#FFFFFF',
    heroBack: '#D7D7D7',
  },
  flat: {
    name: 'flat',
    out: 'none',
    line: '#2B2F45',
    font: 'Montserrat, Arial Black, sans-serif',
    weight: 900,
    shadow: '#1D2133',
    shadowBack: '#3A3F57',
    hero: '#FFFFFF',
    heroBack: '#DCE1EA',
  },
};

export const ThemeContext = createContext<ComicTheme>(THEMES.comic);
export const useComicTheme = () => useContext(ThemeContext);
