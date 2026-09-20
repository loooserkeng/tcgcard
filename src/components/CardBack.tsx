import React from 'react';
import { Sparkles, Crown, Film } from 'lucide-react';

interface CardBackProps {
  className?: string;
}

export const CardBack: React.FC<CardBackProps> = ({ className = '' }) => {
  return (
    <div
      id="card-back-container"
      className={`relative h-full w-full rounded-2xl p-[5px] shadow-2xl overflow-hidden select-none bg-gradient-to-br from-[#7f1d1d] via-[#450a0a] to-[#120205] border-2 border-red-500/50 ${className}`}
      style={{
        boxShadow: '0 20px 45px -10px rgba(0,0,0,0.9), inset 0 0 25px rgba(220,38,38,0.35)',
      }}
    >
      {/* Outer metallic etched frame */}
      <div className="relative h-full w-full rounded-xl border border-red-400/40 bg-[#140306] p-3.5 flex flex-col items-center justify-between overflow-hidden">
        {/* Subtle geometric dot matrix background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(248,113,113,0.4) 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Diagonal crimson light sheen sweep */}
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-red-500/15 to-transparent rotate-45 pointer-events-none animate-foil-sweep" />

        {/* Corner emblems */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-1 text-[10px] tracking-widest font-mono text-red-300 font-bold">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>ACC</span>
          </div>
          <div className="text-[10px] tracking-widest font-mono text-red-300 font-bold">
            PREMIER
          </div>
        </div>

        {/* Central Regal Emblem */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          {/* Glowing concentric red and gold rings */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-red-500/40 animate-pulse-glow" />
            <div className="absolute inset-3 rounded-full border border-dashed border-red-400/50" />
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#590918] via-[#33040d] to-[#120205] flex items-center justify-center shadow-inner border border-red-400/40">
              <div className="relative flex items-center justify-center">
                <Crown className="w-12 h-12 text-amber-400 opacity-90 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                <Film className="w-5 h-5 text-red-300 absolute -bottom-1" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-xl font-extrabold tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-red-100 via-rose-200 to-amber-200 uppercase font-serif">
              ACTRESS
            </h2>
            <div className="text-[10px] tracking-[0.35em] text-red-400 font-bold uppercase mt-0.5">
              CARD COLLECTION
            </div>
          </div>
        </div>

        {/* Bottom edge footer */}
        <div className="w-full flex items-center justify-between border-t border-red-500/30 pt-2 z-10 text-[9px] font-mono tracking-wider text-red-300/80">
          <span>DIGITAL TCG</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-red-200">AUTHENTIC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
