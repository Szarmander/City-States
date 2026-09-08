import React from 'react';

const baseStyle: React.CSSProperties = { height: 'auto', objectFit: 'contain', zIndex: 10 };

export const ACCESSORY_STYLES: Record<string, React.CSSProperties> = {
  'bow_tie.png': { ...baseStyle, width: '35%', top: '75%', left: '32.5%' },
  'crown.png': { ...baseStyle, width: '50%', top: '-15%', left: '25%' },
  'hat.png': { ...baseStyle, width: '55%', top: '-25%', left: '22.5%' },
  'mustache.png': { ...baseStyle, width: '45%', top: '45%', left: '27.5%' }
};
