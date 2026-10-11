import '@fontsource/anton/400.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';

export const COLORS = {
  yellow: '#FFE21A',
  red: '#E8202A',
  white: '#FFFFFF',
  black: '#000000',
};

export const FONTS = {
  title: 'Anton, Impact, sans-serif',
  caption: 'Montserrat, Arial Black, sans-serif',
};

/** Contour noir épais (ombres empilées : fiable dans Chromium). */
export const outline = (size: number, color = '#000') => {
  const shadows: string[] = [];
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    shadows.push(`${(Math.cos(a) * size).toFixed(1)}px ${(Math.sin(a) * size).toFixed(1)}px 0 ${color}`);
  }
  return shadows.join(', ');
};

// Zones sûres TikTok (1080x1920) : haut ~160 px, colonne d'icônes à droite
// (x > 940, y 880-1560), légende/pseudo en bas (y > 1500).
export const SAFE = {
  captionTop: 1130,
  overlayTop: 250,
  sidePadding: 90,
};
