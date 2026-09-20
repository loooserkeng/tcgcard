import React, { useState, useRef } from 'react';
import { Sparkles, Crown, Film, Star } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BoosterPackProps {
  onOpen: () => void;
  packName?: string;
  badge?: string;
  disabled?: boolean;
}

export const BoosterPack: React.FC<BoosterPackProps> = ({
  onOpen,
  packName = 'ACTRESS BOOSTER PACK',
  badge = 'FIRST EDITION',
  disabled = false,
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const packRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!packRef.current) return;
    const rect = packRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -14;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundManager.playPackHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleClick = () => {
    if (disabled) return;
    soundManager.playPackClick();
    onOpen();
  };

  return (
    <div
      ref={packRef}
      id="booster-pack-wrapper"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer select-none transition-transform duration-300 ease-out will-change-transform animate-float"
      style={{
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.04 : 1})`,
      }}
    >
      {/* Dynamic Ambient Red Backlight Glow */}
      <div
        className={`absolute -inset-6 rounded-3xl blur-2xl transition-all duration-500 pointer-events-none ${
          isHovered
            ? 'opacity-90 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 scale-105'
            : 'opacity-60 bg-gradient-to-tr from-red-900/60 via-rose-900/50 to-red-950/40'
        }`}
      />

      {/* Sealed Booster Foil Package Container */}
      <div
        className="relative w-72 h-[440px] sm:w-80 sm:h-[480px] rounded-2xl overflow-hidden p-1 shadow-2xl flex flex-col justify-between"
        style={{
          boxShadow: isHovered
            ? '0 25px 60px -12px rgba(0,0,0,0.95), 0 0 45px rgba(239,68,68,0.6), 0 0 20px rgba(251,191,36,0.3)'
            : '0 20px 45px -10px rgba(0,0,0,0.9), 0 0 25px rgba(220,38,38,0.35)',
          background:
            'linear-gradient(145deg, #7f1d1d 0%, #450a0a 40%, #170205 100%)',
        }}
      >
        {/* Crimped Metallic Teeth at TOP */}
        <div className="relative z-20 h-5 w-full bg-gradient-to-r from-red-950 via-rose-800 to-red-900 flex items-center justify-center border-b border-red-400/30 shadow-sm overflow-hidden">
          <div
            className="w-full h-full opacity-60"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #180205 0px, #180205 2px, transparent 2px, transparent 6px)',
            }}
          />
          {/* Subtle hanging hole punch tab */}
          <div className="absolute top-1 w-10 h-2 rounded-full bg-black/70 border border-red-400/30" />
        </div>

        {/* Moving Metallic Foil Sweep Reflection */}
        <div className="absolute -inset-full z-10 pointer-events-none bg-gradient-to-r from-transparent via-red-200/20 to-transparent rotate-25 animate-foil-sweep" />

        {/* Main Pack Body Surface */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-[#3b0811]/95 via-[#23040a]/90 to-[#120205] border-x border-red-500/20">
          {/* Subtle Holographic Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(248,113,113,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(248,113,113,0.3) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-[10px] font-mono font-black tracking-widest text-red-200">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{badge}</span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          </div>

          {/* Center Logo & Title */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
            {/* Cinematic Crimson Emblem */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-full border border-red-500/40 animate-pulse-glow" />
              <div className="absolute inset-2 rounded-full border border-dashed border-red-400/60" />
              <div className="w-20 h-20 rounded-2xl rotate-45 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-[#140205] flex items-center justify-center -rotate-45">
                  <Crown className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                  <Film className="w-4 h-4 text-red-400 absolute -bottom-1" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-[0.18em] font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-red-200 drop-shadow-md uppercase">
              ACTRESS
            </h1>
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.35em] text-red-300 uppercase mt-0.5">
              CARD COLLECTION
            </div>

            {/* Sub-label */}
            <div className="mt-3 px-3.5 py-0.5 rounded-full bg-black/60 border border-red-500/40 text-[11px] font-mono font-black text-red-300 tracking-wider">
              5 CARDS INSIDE
            </div>
          </div>

          {/* Tear Line Guide */}
          <div className="relative z-10 w-full flex items-center justify-center gap-2 py-1">
            <div className="flex-1 border-t border-dashed border-red-500/50" />
            <span className="text-[9px] font-mono tracking-widest text-red-300/90 uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> TEAR TO OPEN
            </span>
            <div className="flex-1 border-t border-dashed border-red-500/50" />
          </div>

          {/* Bottom Pack Footer */}
          <div className="relative z-10 w-full flex items-center justify-between pt-2 border-t border-red-500/20 text-[9px] font-mono text-red-400/80">
            <span>OFFICIAL BOOSTER</span>
            <span className="text-amber-400 font-bold">PREMIER TCG</span>
          </div>
        </div>

        {/* Crimped Metallic Teeth at BOTTOM */}
        <div className="relative z-20 h-5 w-full bg-gradient-to-r from-red-900 via-rose-800 to-red-950 flex items-center justify-center border-t border-red-400/30 shadow-inner overflow-hidden">
          <div
            className="w-full h-full opacity-60"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #180205 0px, #180205 2px, transparent 2px, transparent 6px)',
            }}
          />
        </div>
      </div>

      {/* Interactive Helper Prompt */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-500/30 backdrop-blur-xs text-xs font-semibold text-red-200 group-hover:border-red-400 group-hover:text-white transition-all shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Click to Open Booster Pack</span>
        </div>
      </div>
    </div>
  );
};
