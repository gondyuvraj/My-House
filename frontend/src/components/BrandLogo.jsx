import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ 
  size = 'md', 
  showText = true, 
  showTagline = true, 
  to = '/',
  className = '' 
}) {
  // Size mapping
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  const LogoContent = (
    <div className={`inline-flex items-center space-x-3 group select-none ${className}`}>
      
      {/* Radiant Shiny Icon Container */}
      <div className={`relative ${iconSizes[size] || iconSizes.md} shrink-0`}>
        {/* Ambient Neon Glow Aura */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 opacity-60 blur-md group-hover:opacity-90 group-hover:blur-lg transition-all duration-500 animate-pulse"></div>

        {/* Glossy Gem Emblem Base */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#1e1338] via-[#0f172a] to-[#2b0922] p-[1.5px] shadow-2xl border border-white/20 group-hover:border-pink-300/60 transition-all duration-300 overflow-hidden flex items-center justify-center">
          
          {/* Moving Diagonal Light Sheen (Periodic & Hover Shine Animation) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent -translate-x-full animate-logo-shine pointer-events-none"></div>

          {/* SVG Vector Emblem */}
          <svg 
            viewBox="0 0 48 48" 
            className="w-[82%] h-[82%] drop-shadow-md transform group-hover:scale-105 transition-transform duration-300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Roof Gradient */}
              <linearGradient id="mhRoofGrad" x1="4" y1="8" x2="44" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="45%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>

              {/* Body Gradient */}
              <linearGradient id="mhBodyGrad" x1="8" y1="18" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="60%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Illuminated Warm Doorway */}
              <linearGradient id="mhDoorGrad" x1="18" y1="26" x2="30" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              {/* Shimmer Highlight */}
              <linearGradient id="mhShimmerGrad" x1="12" y1="10" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Sparkle Star Gradient */}
              <linearGradient id="mhStarGrad" x1="32" y1="2" x2="42" y2="14" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="40%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>

              {/* Filter for golden star sparkle glow */}
              <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Main Modern Architectural Roof Facet */}
            <path 
              d="M24 6L6 20H12V39C12 40.6569 13.3431 42 15 42H33C34.6569 42 36 40.6569 36 39V20H42L24 6Z" 
              fill="url(#mhRoofGrad)" 
            />

            {/* Inner House Facet Core */}
            <path 
              d="M24 10.5L14 18.5V38.5C14 39.3284 14.6716 40 15.5 40H32.5C33.3284 40 34 39.3284 34 38.5V18.5L24 10.5Z" 
              fill="url(#mhBodyGrad)" 
            />

            {/* Triangular Glass Refraction Highlight (Upper Slope) */}
            <path 
              d="M24 10.5L14 18.5H34L24 10.5Z" 
              fill="url(#mhShimmerGrad)" 
            />

            {/* Glowing Golden Welcome Portal / Arch Doorway */}
            <path 
              d="M20.5 40V28C20.5 26.067 22.067 24.5 24 24.5C25.933 24.5 27.5 26.067 27.5 28V40H20.5Z" 
              fill="url(#mhDoorGrad)" 
            />

            {/* Keyhole / Resident Heart in Door */}
            <circle cx="24" cy="28.5" r="1.5" fill="#78350F" />
            <path d="M23.2 29.5H24.8L25.2 33.5H22.8L23.2 29.5Z" fill="#78350F" />

            {/* Window Light Panels */}
            <rect x="16.5" y="24" width="2.5" height="4" rx="0.8" fill="#FFFFFF" fillOpacity="0.4" />
            <rect x="29" y="24" width="2.5" height="4" rx="0.8" fill="#FFFFFF" fillOpacity="0.4" />

            {/* Radiant 4-Point Diamond Sparkle Star (Roof Apex) */}
            <g filter="url(#starGlow)">
              <path 
                d="M37 2C37 5.5 39.5 8 43 8C39.5 8 37 10.5 37 14C37 10.5 34.5 8 31 8C34.5 8 37 5.5 37 2Z" 
                fill="url(#mhStarGrad)" 
              />
              <circle cx="37" cy="8" r="1" fill="#FFFFFF" />
            </g>

            {/* Secondary Mini Sparkle */}
            <path 
              d="M9 11C9 12.5 10.2 13.5 11.5 13.5C10.2 13.5 9 14.5 9 16C9 14.5 7.8 13.5 6.5 13.5C7.8 13.5 9 12.5 9 11Z" 
              fill="#FDE047" 
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span className={`font-black ${textSizes[size] || textSizes.md} tracking-tight text-white drop-shadow-sm`}>
              My<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-200 to-indigo-200">House</span>
            </span>
            {/* Glowing Golden Sparkle Accent */}
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-amber-300 to-rose-400 shadow-[0_0_8px_#f59e0b]"></span>
            </span>
          </div>

          {showTagline && (
            <span className={`font-extrabold ${taglineSizes[size] || taglineSizes.md} uppercase tracking-wider text-pink-100/90 mt-1 flex items-center space-x-1`}>
              <span className="text-rose-300 font-black">PG</span>
              <span>•</span>
              <span className="text-indigo-200 font-bold">ROOMS</span>
              <span>•</span>
              <span className="text-amber-200 font-bold">FLATMATES</span>
            </span>
          )}
        </div>
      )}

    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
}
