import React, { useState, useRef } from 'react';
import { ActressCard } from '../types';
import { getRarityDetails } from '../data/rarity';
import { Sparkles, Heart, Film, Calendar, Star, Crown } from 'lucide-react';

interface CardProps {
  card: ActressCard;
  isNew?: boolean;
  copies?: number;
  interactiveTilt?: boolean;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  card,
  isNew = false,
  copies,
  interactiveTilt = true,
  className = '',
  onClick,
  size = 'md',
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const rarityInfo = getRarityDetails(card.rarity);
  const isCommon = card.rarity === 'COMMON';
  const isRare = card.rarity === 'RARE';
  const isSpecial = card.rarity === 'SPECIAL' || card.rarity === 'UNCOMMON';
  const isEpic = card.rarity === 'EPIC' || card.rarity === 'ULTRA_RARE';
  const isLegendary = card.rarity === 'LEGENDARY';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: isLegendary ? 0.85 : isEpic ? 0.75 : isSpecial ? 0.65 : isRare ? 0.5 : 0.3,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  // Dimensions based on size
  const sizeClasses = {
    sm: 'w-44 h-[280px] text-xs',
    md: 'w-64 h-[410px] sm:w-72 sm:h-[450px] text-sm',
    lg: 'w-72 h-[460px] sm:w-80 sm:h-[510px] text-sm',
  };

  // Image source with fallback
  const imageSrc = card.image || card.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85';

  return (
    <div
      ref={cardRef}
      id={`actress-card-${card.id}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none cursor-pointer rounded-2xl p-[5px] transition-transform duration-200 ease-out will-change-transform ${sizeClasses[size]} ${className}`}
      style={{
        transform: interactiveTilt
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
          : undefined,
        boxShadow: isLegendary
          ? `0 20px 45px -10px rgba(0,0,0,0.9), 0 0 35px rgba(251,191,36,0.5), 0 0 60px rgba(220,38,38,0.4)`
          : isEpic
          ? `0 18px 40px -10px rgba(0,0,0,0.9), 0 0 30px rgba(220,38,38,0.6)`
          : isSpecial
          ? `0 16px 36px -10px rgba(0,0,0,0.85), 0 0 24px rgba(255,46,91,0.5)`
          : isRare
          ? `0 14px 30px -10px rgba(0,0,0,0.85), 0 0 18px rgba(239,68,68,0.4)`
          : `0 12px 24px -10px rgba(0,0,0,0.8), 0 0 10px rgba(239,68,68,0.2)`,
        background: isLegendary
          ? 'linear-gradient(135deg, #fbbf24 0%, #dc2626 40%, #7f1d1d 70%, #fbbf24 100%)'
          : isEpic
          ? 'linear-gradient(135deg, #ef4444 0%, #991b1b 50%, #450a0a 100%)'
          : isSpecial
          ? 'linear-gradient(135deg, #ff2e5b 0%, #881337 60%, #4c0519 100%)'
          : isRare
          ? 'linear-gradient(135deg, #f87171 0%, #7f1d1d 70%, #200307 100%)'
          : 'linear-gradient(135deg, #fca5a5 0%, #450a0a 60%, #1f0408 100%)',
      }}
    >
      {/* Inner Card Container */}
      <div
        className={`relative h-full w-full rounded-xl border flex flex-col justify-between overflow-hidden bg-gradient-to-b ${rarityInfo.bgGradient} ${
          isLegendary
            ? 'border-amber-400/80'
            : isEpic
            ? 'border-red-500/80'
            : isSpecial
            ? 'border-rose-500/70'
            : isRare
            ? 'border-red-500/50'
            : 'border-red-400/30'
        }`}
      >
        {/* Holographic Specular Glare Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: isLegendary
              ? `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(254,240,138,0.7) 0%, rgba(245,158,11,0.4) 30%, rgba(220,38,38,0.2) 60%, transparent 80%)`
              : isEpic
              ? `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.7) 0%, rgba(220,38,38,0.5) 30%, transparent 75%)`
              : isSpecial
              ? `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.65) 0%, rgba(255,46,91,0.4) 35%, transparent 75%)`
              : `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.45) 0%, transparent 65%)`,
          }}
        />

        {/* Moving Prismatic Streaks for Special, Epic, and Legendary */}
        {(isSpecial || isEpic || isLegendary) && (
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-25 mix-blend-color-dodge animate-holographic"
            style={{
              backgroundImage:
                'linear-gradient(115deg, transparent 20%, rgba(255,100,100,0.5) 35%, rgba(255,215,0,0.4) 50%, rgba(255,50,80,0.5) 65%, transparent 80%)',
            }}
          />
        )}

        {/* Dynamic Light Sheen Sweep */}
        {!isCommon && (
          <div className="pointer-events-none absolute -inset-full z-20 bg-gradient-to-r from-transparent via-red-200/15 to-transparent rotate-35 animate-foil-sweep" />
        )}

        {/* --- CARD HEADER --- */}
        <div className="relative z-10 flex items-center justify-between px-2.5 py-1.5 border-b border-red-500/20 bg-black/60 backdrop-blur-xs">
          {/* Card Number & Series */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] sm:text-[11px] font-black tracking-wider text-red-300">
              {card.cardNumber}
            </span>
            {isLegendary && (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
                ROYAL
              </span>
            )}
          </div>

          {/* Rarity Badge */}
          <div className="flex items-center gap-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                isLegendary
                  ? 'bg-gradient-to-r from-amber-500/30 to-red-600/30 border-amber-400 text-amber-300 shadow-sm shadow-amber-500/30'
                  : isEpic
                  ? 'bg-red-600/30 border-red-500 text-red-200 shadow-sm shadow-red-600/30'
                  : isSpecial
                  ? 'bg-rose-600/25 border-rose-400 text-rose-200'
                  : isRare
                  ? 'bg-red-900/40 border-red-500/60 text-red-300'
                  : 'bg-white/10 border-white/20 text-neutral-200'
              }`}
            >
              {isLegendary && <Crown className="w-2.5 h-2.5 text-amber-400" />}
              {isEpic && <Sparkles className="w-2.5 h-2.5 text-red-400" />}
              <span>{rarityInfo.label}</span>
            </span>
          </div>
        </div>

        {/* --- MAIN ACTRESS IMAGE --- */}
        <div className="relative z-10 mx-2 my-1 flex-1 rounded-lg overflow-hidden border border-red-500/30 bg-neutral-950 shadow-inner group">
          {!imageError ? (
            <img
              src={imageSrc}
              alt={card.name}
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a060d] to-[#120205] p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <span className="font-bold text-white text-sm font-serif">{card.name}</span>
            </div>
          )}

          {/* Cinematic Red Vignette & Gradient Shadows */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0b0204] via-transparent to-black/30" />

          {/* Beauty Rate Badge (Top Left Corner of Photo) */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-red-500/40 shadow-lg">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[9px] sm:text-[10px] font-mono font-black text-white">
              {card.beautyRate || 95}
            </span>
            <span className="text-[7px] font-mono text-red-400 uppercase font-bold">
              RATE
            </span>
          </div>

          {/* Date of Birth & Age Pill (Bottom Left of Photo) */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-white/15 text-[9px] font-mono text-neutral-200">
            <Calendar className="w-2.5 h-2.5 text-red-400" />
            <span className="truncate max-w-[130px]">{card.dateOfBirth}</span>
            <span className="text-red-400 font-bold">• Age {card.age}</span>
          </div>

          {/* New / Duplicate Badges */}
          {isNew && (
            <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-black tracking-widest uppercase shadow-lg shadow-red-500/60 animate-pulse">
              NEW
            </div>
          )}
          {copies && copies > 1 && !isNew && (
            <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-black/80 border border-red-500/40 text-red-300 text-[9px] font-black font-mono tracking-wider shadow-lg">
              {copies}× OWNED
            </div>
          )}
        </div>

        {/* --- CARD FOOTER & DETAILS --- */}
        <div className="relative z-10 p-2.5 pt-1.5 bg-gradient-to-b from-black/75 to-black/95 backdrop-blur-md border-t border-red-500/25 flex flex-col gap-1.5">
          {/* Actress Name */}
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-black tracking-wide text-sm sm:text-base text-white font-serif uppercase truncate">
              {card.name}
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 shrink-0">
              <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
              <span>{card.beautyRate}</span>
            </div>
          </div>

          {/* Featured Movies Pill Tags */}
          <div className="flex items-center gap-1 overflow-hidden">
            <Film className="w-2.5 h-2.5 text-red-400 shrink-0" />
            <div className="flex items-center gap-1 overflow-hidden text-[9px] font-mono text-neutral-300 truncate">
              {card.movies && card.movies.length > 0 ? (
                card.movies.slice(0, size === 'sm' ? 1 : 2).map((movie, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-300 truncate"
                  >
                    {movie}
                  </span>
                ))
              ) : (
                <span className="text-neutral-400 italic">Leading Actress</span>
              )}
              {card.movies && card.movies.length > (size === 'sm' ? 1 : 2) && (
                <span className="text-[8px] text-red-400 font-bold">
                  +{card.movies.length - (size === 'sm' ? 1 : 2)}
                </span>
              )}
            </div>
          </div>

          {/* Subtitle / Quote (Hidden on sm) */}
          {size !== 'sm' && card.quote && (
            <p className="text-[10px] text-neutral-300/90 leading-tight line-clamp-1 italic font-sans">
              "{card.quote}"
            </p>
          )}

          {/* Bottom Card Collection Branding */}
          <div className="flex items-center justify-between pt-0.5 border-t border-red-500/15 text-[8px] font-mono text-red-400/80 tracking-widest uppercase">
            <span>ACTRESS COLLECTION</span>
            <span>SERIES I</span>
          </div>
        </div>
      </div>
    </div>
  );
};
