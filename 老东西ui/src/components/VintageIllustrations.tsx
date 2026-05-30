/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface IllustrationProps {
  className?: string;
  grayscale?: boolean;
  blurLevel?: number; // 0 to 10
}

export function WhitePorcelainTeacup({ className = "", grayscale = false, blurLevel = 0 }: IllustrationProps) {
  const filterStyles: React.CSSProperties = {
    filter: `${grayscale ? 'grayscale(100%)' : ''} ${blurLevel > 0 ? `blur(${blurLevel}px)` : ''}`,
    transition: 'filter 0.5s ease-out',
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`w-full h-full ${className}`} 
      style={filterStyles}
    >
      <rect width="200" height="200" fill="#f8f5ee" />
      
      {/* Background shadow/glow */}
      <ellipse cx="100" cy="145" rx="55" ry="10" fill="#dfdacb" opacity="0.6" />
      
      {/* Decorative shelf wood background */}
      <line x1="20" y1="150" x2="180" y2="150" stroke="#cdbeab" strokeWidth="3" strokeLinecap="round" />
      
      {/* Steam trails (only when not heavily blurred) */}
      {blurLevel < 4 && (
        <g stroke="#dfdacb" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M75,65 Q80,50 75,35 Q70,25 78,15" opacity="0.4" className="animate-pulse" />
          <path d="M100,58 Q105,45 98,30 Q90,20 102,10" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <path d="M125,62 Q120,48 127,33 Q132,23 124,15" opacity="0.3" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
        </g>
      )}

      {/* Teacup Handle */}
      <path 
        d="M135,100 C165,100 165,130 135,130" 
        fill="none" 
        stroke="#e5dfd3" 
        strokeWidth="10" 
        strokeLinecap="round" 
      />
      <path 
        d="M135,100 C165,100 165,130 135,130" 
        fill="none" 
        stroke={grayscale ? "#a09c95" : "#aa7d54"} 
        strokeWidth="3" 
        strokeLinecap="round" 
      />

      {/* Main Teacup Body */}
      <path 
        d="M55,90 L145,90 C145,90 145,135 125,140 L75,140 C55,135 55,90 55,90 Z" 
        fill="#fcfaf2" 
        stroke={grayscale ? "#88847e" : "#514338"} 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />
      
      {/* Glazing highlights */}
      <path d="M63,94 L63,125" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      
      {/* Handpainted blue pattern on teacup (grayscale makes it gray) */}
      <path 
        d="M 68,110 C 80,118 100,105 110,118 M 105,105 C 110,115 125,115 132,108" 
        fill="none" 
        stroke={grayscale ? "#7a7771" : "#5e6b75"} 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
      <circle cx="90" cy="112" r="3" fill={grayscale ? "#716d67" : "#526270"} />
      <circle cx="118" cy="113" r="3.5" fill={grayscale ? "#716d67" : "#526270"} />
      
      {/* Teacup rim gold line / bronze line */}
      <path 
        d="M55,90 L145,90" 
        stroke={grayscale ? "#a8a29a" : "#aa7d54"} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {/* The chip/dent on the left rim (the crucial memory detail described!) */}
      <path 
        d="M65,92 L72,88 M72,88 L75,91" 
        stroke={grayscale ? "#484643" : "#32271f"} 
        strokeWidth="3.5" 
      />
      <circle cx="73" cy="91" r="2.5" fill={grayscale ? "#585550" : "#3e2e21"} />

      {/* Saucer plate at bottom */}
      <path 
        d="M45,145 L155,145 C155,145 150,154 135,155 L65,155 C50,154 45,145 45,145 Z" 
        fill="#faf8f4" 
        stroke={grayscale ? "#98948d" : "#514338"} 
        strokeWidth="4" 
        strokeLinejoin="round" 
      />
      <path 
        d="M55,145 L145,145" 
        stroke={grayscale ? "#cbc5bb" : "#d7cfc0"} 
        strokeWidth="2.5" 
      />
    </svg>
  );
}

export function WallClock59({ className = "", grayscale = false, blurLevel = 0 }: IllustrationProps) {
  const filterStyles: React.CSSProperties = {
    filter: `${grayscale ? 'grayscale(100%)' : ''} ${blurLevel > 0 ? `blur(${blurLevel}px)` : ''}`,
    transition: 'filter 0.5s ease-out',
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`w-full h-full ${className}`} 
      style={filterStyles}
    >
      <rect width="200" height="200" fill="#f8f5ee" />
      
      {/* Wood wall texture background */}
      <ellipse cx="100" cy="180" rx="40" ry="6" fill="#e4decb" opacity="0.6" />
      <line x1="100" y1="10" x2="100" y2="185" stroke="#e0d6c5" strokeWidth="1" strokeDasharray="3,3" />

      {/* Pendulum structure */}
      <line x1="100" y1="110" x2="100" y2="165" stroke={grayscale ? "#7c7872" : "#94765d"} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="165" r="12" fill={grayscale ? "#9c9892" : "#aa7d54"} stroke={grayscale ? "#73706b" : "#4e3b2b"} strokeWidth="2.5" />
      {/* Pendulum reflection */}
      <path d="M96,160 A8,8 0 0,1 104,160" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />

      {/* Main retro wall clock body octagonal layout */}
      <polygon 
        points="70,25 130,25 160,55 160,115 130,145 70,145 40,115 40,55" 
        fill={grayscale ? "#7c8488" : "#4e5f60"} // 59 style classic mossy green/blue-gray or teal
        stroke={grayscale ? "#595d60" : "#3c4748"} 
        strokeWidth="6" 
        strokeLinejoin="round" 
      />
      
      {/* Outer wooden border */}
      <polygon 
        points="72,29 128,29 156,57 156,113 128,141 72,141 44,113 44,57" 
        fill="none" 
        stroke={grayscale ? "#9c968f" : "#8a6642"} 
        strokeWidth="2.5" 
      />

      {/* Clock Face Panel */}
      <circle 
        cx="100" 
        cy="85" 
        r="44" 
        fill="#fcfaf2" 
        stroke={grayscale ? "#68645e" : "#4e3a2c"} 
        strokeWidth="4" 
      />
      
      {/* Clock face inner gold circle */}
      <circle 
        cx="100" 
        cy="85" 
        r="38" 
        fill="none" 
        stroke={grayscale ? "#d2ccbf" : "#aa7d54"} 
        strokeWidth="1.5" 
        opacity="0.7"
      />

      {/* Vintage hour markers */}
      <g stroke={grayscale ? "#5c5750" : "#322315"} strokeWidth="2.5" strokeLinecap="round">
        <line x1="100" y1="46" x2="100" y2="52" /> {/* 12 */}
        <line x1="139" y1="85" x2="133" y2="85" /> {/* 3 */}
        <line x1="100" y1="124" x2="100" y2="118" /> {/* 6 */}
        <line x1="61" y1="85" x2="67" y2="85" /> {/* 9 */}
      </g>

      {/* Roman/vintage subtle details */}
      <text x="100" y="65" textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="bold" fill={grayscale ? "#938d84" : "#aa7d54"} opacity="0.8">XII</text>
      <text x="100" y="113" textAnchor="middle" fontSize="9" fontFamily="serif" fill={grayscale ? "#b5b0a7" : "#8d7c6e"}>5 9式</text>

      {/* Clock Hands */}
      {/* Hour Hand pointing to 8 */}
      <line 
        x1="100" 
        y1="85" 
        x2="84" 
        y2="95" 
        stroke={grayscale ? "#484541" : "#1f1409"} 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      {/* Minute Hand pointing to 12 */}
      <line 
        x1="100" 
        y1="85" 
        x2="100" 
        y2="55" 
        stroke={grayscale ? "#484541" : "#1f1409"} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      
      {/* Center cap cover */}
      <circle cx="100" cy="85" r="5" fill={grayscale ? "#68645e" : "#514332"} />
      <circle cx="100" cy="85" r="2.5" fill={grayscale ? "#c7beb2" : "#f1e5cf"} />
    </svg>
  );
}

export function SewingMachine({ className = "", grayscale = false, blurLevel = 0 }: IllustrationProps) {
  const filterStyles: React.CSSProperties = {
    filter: `${grayscale ? 'grayscale(100%)' : ''} ${blurLevel > 0 ? `blur(${blurLevel}px)` : ''}`,
    transition: 'filter 0.5s ease-out',
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`w-full h-full ${className}`} 
      style={filterStyles}
    >
      <rect width="200" height="200" fill="#f8f5ee" />
      
      <ellipse cx="100" cy="155" rx="70" ry="12" fill="#decab1" opacity="0.5" />
      
      {/* Wood Base Platform */}
      <rect 
        x="20" 
        y="135" 
        width="160" 
        height="18" 
        rx="2"
        fill={grayscale ? "#9c9389" : "#6c4e31"} 
        stroke={grayscale ? "#6d645b" : "#442b15"} 
        strokeWidth="3.5" 
      />
      
      {/* Base highlights */}
      <line x1="25" y1="140" x2="175" y2="140" stroke={grayscale ? "#cfc5ba" : "#9f7d5c"} strokeWidth="1.5" />

      {/* Main Cast Iron Arch of Sewing Machine */}
      <path 
        d="M145,135 
           L145,95 
           C145,65 115,55 85,55 
           C65,55 50,60 45,75
           L45,115
           L55,115
           C52,100 52,90 56,80
           C62,70 75,70 90,70
           Q125,70 125,95
           L125,135
           Z" 
        fill={grayscale ? "#484a4c" : "#1e2224"} 
        stroke={grayscale ? "#6e7275" : "#32393d"} 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />

      {/* Gold decals (the typical classic patterns on Butterfly sewing machines) */}
      {blurLevel < 3 && (
        <path 
          d="M75,62 Q95,62 110,65" 
          fill="none" 
          stroke={grayscale ? "#c7c1b8" : "#aa7d54"} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          opacity="0.8" 
        />
      )}
      {blurLevel < 3 && (
        <g stroke={grayscale ? "#c7c1b8" : "#aa7d54"} strokeWidth="1.5" fill="none">
          <circle cx="105" cy="85" r="4" opacity="0.6" />
          <path d="M125,100 A15,15 0 0,1 125,120" opacity="0.7" />
        </g>
      )}

      {/* The metallic mechanical columns on the left */}
      {/* Needle bar */}
      <line x1="48" y1="110" x2="48" y2="135" stroke={grayscale ? "#a29c95" : "#ccd5db"} strokeWidth="3.5" />
      {/* Presser foot */}
      <line x1="53" y1="115" x2="53" y2="133" stroke={grayscale ? "#726d67" : "#9aa2a7"} strokeWidth="2.5" />
      <path d="M44,133 L54,133" stroke={grayscale ? "#726d67" : "#9aa2a7"} strokeWidth="3" strokeLinecap="round" />

      {/* Wheel on the right */}
      <ellipse 
        cx="148" 
        cy="90" 
        rx="10" 
        ry="25" 
        fill={grayscale ? "#625f5a" : "#aa7d54"} 
        stroke={grayscale ? "#464440" : "#513a26"} 
        strokeWidth="2.5" 
      />
      <ellipse 
        cx="148" 
        cy="90" 
        rx="4" 
        ry="12" 
        fill={grayscale ? "#3a3835" : "#2a2118"} 
      />
      {/* Wheel axle handle connector */}
      <rect x="154" y="80" width="3" height="20" rx="1" fill={grayscale ? "#928d84" : "#dee5eb"} />
      <circle cx="155" cy="90" r="2.5" fill={grayscale ? "#625d57" : "#a66832"} />

      {/* Spool holder thread at the top */}
      <rect x="110" y="47" width="3" height="8" fill={grayscale ? "#938e87" : "#cbd1d6"} />
      {/* Spool of thread */}
      <rect x="104" y="37" width="15" height="10" rx="1" fill={grayscale ? "#848a8e" : "#aa3a2e"} /> {/* Red thread spool */}
      <path d="M111,39 Q80,45 48,111" fill="none" stroke={grayscale ? "#cfc7bc" : "#e49e8a"} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

export function UnknownRetroObject({ className = "", grayscale = true, blurLevel = 5 }: IllustrationProps) {
  const filterStyles: React.CSSProperties = {
    filter: `${grayscale ? 'grayscale(100%)' : ''} ${blurLevel > 0 ? `blur(${blurLevel}px)` : ''}`,
    transition: 'filter 0.5s ease-out',
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`w-full h-full ${className}`} 
      style={filterStyles}
    >
      <rect width="200" height="200" fill="#f8f5ee" />
      {/* Ambient shadow */}
      <ellipse cx="100" cy="140" rx="60" ry="15" fill="#dfdacb" opacity="0.7" />
      
      {/* Vintage Radio Shape */}
      <rect 
        x="45" 
        y="60" 
        width="110" 
        height="75" 
        rx="8" 
        fill={grayscale ? "#75726d" : "#8d5d3e"} 
        stroke={grayscale ? "#56534f" : "#4a301f"} 
        strokeWidth="5" 
      />
      
      {/* Grille mesh area */}
      <rect x="55" y="70" width="60" height="55" rx="4" fill={grayscale ? "#b5b0a7" : "#dfd8cb"} stroke={grayscale ? "#757068" : "#8a7e70"} strokeWidth="1.5" />
      {/* Speaker lines */}
      <g stroke={grayscale ? "#928d84" : "#a89e90"} strokeWidth="2">
        <line x1="62" y1="78" x2="108" y2="78" />
        <line x1="62" y1="86" x2="108" y2="86" />
        <line x1="62" y1="94" x2="108" y2="94" />
        <line x1="62" y1="102" x2="108" y2="102" />
        <line x1="62" y1="110" x2="108" y2="110" />
        <line x1="62" y1="118" x2="108" y2="118" />
      </g>

      {/* Dials area on the right */}
      <rect x="123" y="70" width="22" height="55" rx="3" fill={grayscale ? "#5e5c58" : "#3e2e21"} />
      <circle cx="134" cy="83" r="5" fill={grayscale ? "#ababa8" : "#cbb29c"} stroke="#111" strokeWidth="1" />
      <circle cx="134" cy="100" r="5" fill={grayscale ? "#ababa8" : "#cbb29c"} stroke="#111" strokeWidth="1" />
      <rect x="131" y="112" width="6" height="8" rx="1" fill={grayscale ? "#8e8e89" : "#aa7d54"} />

      {/* Retro loop handle on top */}
      <path d="M75,60 C75,40 125,40 125,60" fill="none" stroke={grayscale ? "#989895" : "#e5dfd3"} strokeWidth="5" strokeLinecap="round" />
      <path d="M75,60 C75,40 125,40 125,60" fill="none" stroke={grayscale ? "#6a6a68" : "#aa7d54"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
