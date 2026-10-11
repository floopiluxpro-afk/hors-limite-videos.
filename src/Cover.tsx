import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COLORS, FONTS, outline} from './theme';
import {useFonts} from './Video';

export type CoverProps = {
  image: string;
  /** Lignes du titre ; *mot* = en jaune et plus gros. */
  title: string[];
  badge?: string;
  imageScale?: number;
  imageOrigin?: string;
};

// Zone sûre : la grille du profil TikTok recadre la couverture en 3:4 au centre
// (y ≈ 240 à 1680), tout le texte reste dedans.
export const Cover: React.FC<CoverProps> = ({image, title, badge, imageScale = 1.05, imageOrigin = '50% 30%'}) => {
  useFonts();
  return (
  <AbsoluteFill style={{backgroundColor: '#111'}}>
    <AbsoluteFill style={{transform: `scale(${imageScale})`, transformOrigin: imageOrigin}}>
      <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
    <AbsoluteFill
      style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.8) 100%)'}}
    />
    {badge ? (
      <div
        style={{
          position: 'absolute',
          top: 300,
          right: 70,
          transform: 'rotate(8deg)',
          background: COLORS.red,
          border: '8px solid #000',
          borderRadius: 24,
          padding: '6px 30px',
          boxShadow: '0 14px 30px rgba(0,0,0,.55)',
          fontFamily: FONTS.title,
          fontSize: 120,
          lineHeight: 1.05,
          color: COLORS.white,
          textShadow: outline(5),
        }}
      >
        {badge}
      </div>
    ) : null}
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        bottom: 300,
        textAlign: 'center',
        transform: 'rotate(-3deg)',
      }}
    >
      {title.map((line, i) => {
        const hl = /^\*.*\*$/.test(line);
        return (
          <div
            key={i}
            style={{
              fontFamily: FONTS.title,
              fontSize: hl ? 230 : 120,
              lineHeight: hl ? 0.98 : 1.08,
              color: hl ? COLORS.yellow : COLORS.white,
              textShadow: `${outline(hl ? 13 : 9)}, 0 18px 40px rgba(0,0,0,.7)`,
              textTransform: 'uppercase',
            }}
          >
            {line.replace(/^\*|\*$/g, '')}
          </div>
        );
      })}
      <div
        style={{
          marginTop: 34,
          fontFamily: FONTS.title,
          fontSize: 54,
          letterSpacing: 4,
          textShadow: outline(5),
        }}
      >
        <span style={{color: COLORS.white}}>HORS</span> <span style={{color: COLORS.yellow}}>LIMITE</span>
      </div>
    </div>
  </AbsoluteFill>
  );
};
