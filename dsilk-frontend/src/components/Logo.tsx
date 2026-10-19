import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  showText = true,
  className = '' 
}) => {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, overflow: 'visible' }}
        aria-label="Logo Dsilk"
      >
        <defs>
          {/* Gradiente Ciano (Superior) */}
          <linearGradient id="cmyk-cyan" x1="42" y1="10" x2="68" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B5F7" />
            <stop offset="60%" stopColor="#009FE3" />
            <stop offset="100%" stopColor="#0082C8" />
          </linearGradient>

          {/* Gradiente Magenta (Direita) */}
          <linearGradient id="cmyk-magenta" x1="86" y1="42" x2="52" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF1D93" />
            <stop offset="60%" stopColor="#E6007E" />
            <stop offset="100%" stopColor="#C40068" />
          </linearGradient>

          {/* Gradiente Amarelo (Inferior) */}
          <linearGradient id="cmyk-yellow" x1="58" y1="88" x2="32" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF200" />
            <stop offset="65%" stopColor="#FFDE00" />
            <stop offset="100%" stopColor="#E5B800" />
          </linearGradient>

          {/* Gradiente Preto / Key (Esquerda) */}
          <linearGradient id="cmyk-black" x1="12" y1="58" x2="48" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3E4249" />
            <stop offset="60%" stopColor="#222428" />
            <stop offset="100%" stopColor="#141517" />
          </linearGradient>

          {/* Gradientes Prata / Branco (Dobras 3D de cada pétala) */}
          <linearGradient id="cmyk-silver-top" x1="32" y1="18" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E7ED" />
            <stop offset="100%" stopColor="#BAC3CE" />
          </linearGradient>

          <linearGradient id="cmyk-silver-right" x1="78" y1="32" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E7ED" />
            <stop offset="100%" stopColor="#BAC3CE" />
          </linearGradient>

          <linearGradient id="cmyk-silver-bottom" x1="68" y1="78" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E7ED" />
            <stop offset="100%" stopColor="#BAC3CE" />
          </linearGradient>

          <linearGradient id="cmyk-silver-left" x1="22" y1="68" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E7ED" />
            <stop offset="100%" stopColor="#BAC3CE" />
          </linearGradient>

          {/* Sombra sutil para profundidade 3D */}
          <filter id="cmyk-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0.5" dy="1.2" stdDeviation="1" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* 1. DOBRAS PRATEADAS (Fundo 3D) */}
        {/* Prata Superior-Esquerda (Apoio do Ciano) */}
        <path
          d="M 50 50 C 48 40 43 28 37 20 C 34 16 39 12 45 12 C 48 12 50 14 50 17 C 50 26 49.8 38 50 50 Z"
          fill="url(#cmyk-silver-top)"
        />

        {/* Prata Superior-Direita (Apoio do Magenta) */}
        <path
          d="M 50 50 C 60 48 72 43 80 37 C 84 34 88 39 88 45 C 88 48 86 50 83 50 C 74 50 62 49.8 50 50 Z"
          fill="url(#cmyk-silver-right)"
        />

        {/* Prata Inferior-Direita (Apoio do Amarelo) */}
        <path
          d="M 50 50 C 52 60 57 72 63 80 C 66 84 61 88 55 88 C 52 88 50 86 50 83 C 50 74 50.2 62 50 50 Z"
          fill="url(#cmyk-silver-bottom)"
        />

        {/* Prata Inferior-Esquerda (Apoio do Preto) */}
        <path
          d="M 50 50 C 40 52 28 57 20 63 C 16 66 12 61 12 55 C 12 52 14 50 17 50 C 26 50 38 50.2 50 50 Z"
          fill="url(#cmyk-silver-left)"
        />

        {/* 2. PÉTALAS COLORIDAS (Catavento CMYK em espiral) */}
        {/* Pétala Superior: Ciano */}
        <path
          d="M 50 50 C 49.8 38 50 26 50 17 C 55 12 66 16 70 25 C 73 34 65 44 50 50 Z"
          fill="url(#cmyk-cyan)"
          filter="url(#cmyk-shadow)"
        />

        {/* Pétala Direita: Magenta */}
        <path
          d="M 50 50 C 62 49.8 74 50 83 50 C 88 55 84 66 75 70 C 66 73 56 65 50 50 Z"
          fill="url(#cmyk-magenta)"
          filter="url(#cmyk-shadow)"
        />

        {/* Pétala Inferior: Amarelo */}
        <path
          d="M 50 50 C 50.2 62 50 74 50 83 C 45 88 34 84 30 75 C 27 66 35 56 50 50 Z"
          fill="url(#cmyk-yellow)"
          filter="url(#cmyk-shadow)"
        />

        {/* Pétala Esquerda: Preto */}
        <path
          d="M 50 50 C 38 50.2 26 50 17 50 C 12 45 16 34 25 30 C 34 27 44 35 50 50 Z"
          fill="url(#cmyk-black)"
          filter="url(#cmyk-shadow)"
        />

        {/* Ponto de Centro sutil para acabamento perfeito */}
        <circle cx="50" cy="50" r="1.8" fill="#FFFFFF" opacity="0.85" />
      </svg>
      {showText && <span className="logo-text">Dsilk</span>}
    </div>
  );
};

