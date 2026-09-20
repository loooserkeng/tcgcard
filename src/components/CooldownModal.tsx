import React from 'react';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/audio';
import { Clock, Layers, Package, X } from 'lucide-react';

interface CooldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'COLLECTION' | 'PACKS') => void;
}

export const CooldownModal: React.FC<CooldownModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { cooldown } = useAuth();

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, ((3600 - cooldown.cooldownRemainingSeconds) / 3600) * 100)
  );

  return (
    <div
      id="cooldown-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-[#140205] border border-red-500/40 p-6 sm:p-8 shadow-2xl shadow-red-950/60 flex flex-col items-center text-center overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="close-cooldown-modal-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/30 flex items-center justify-center text-red-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-red-600/25 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
          <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="relative z-10 text-2xl font-black font-serif tracking-[0.15em] text-white uppercase">
          BOOSTER ALLOWANCE FULL
        </h3>

        {/* Subtitle */}
        <p className="relative z-10 text-sm font-sans text-red-200/80 mt-2 max-w-xs">
          You’ve opened all 5 available booster packs in this batch.
        </p>

        {/* Countdown Box */}
        <div className="relative z-10 w-full my-6 p-5 rounded-2xl bg-black/60 border border-red-500/25 flex flex-col items-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-red-300/80 font-bold mb-2">
            NEXT 5 PACKS UNLOCK IN
          </span>

          <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-amber-400 mb-3">
            {formatTimer(cooldown.cooldownRemainingSeconds)}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-red-950">
            <div
              className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="w-full flex justify-between text-[10px] font-mono text-neutral-400 mt-2">
            <span>Recharging</span>
            <span>{Math.round(progressPercent)}% Charged</span>
          </div>
        </div>

        <p className="relative z-10 text-xs font-sans text-red-200/70 mb-6 max-w-xs">
          Inspect your unlocked actresses in the vault or view your booster opening history while your next batch charges.
        </p>

        {/* Navigation Action Buttons */}
        <div className="relative z-10 w-full grid grid-cols-2 gap-3">
          <button
            id="cooldown-view-collection-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
              onNavigateTab('COLLECTION');
            }}
            className="py-3 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-100 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-red-400" />
            <span>COLLECTION</span>
          </button>

          <button
            id="cooldown-view-history-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
              onNavigateTab('PACKS');
            }}
            className="py-3 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-100 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-rose-400" />
            <span>BOOSTER VAULT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
