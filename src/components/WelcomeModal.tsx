import React from 'react';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/audio';
import { Sparkles, Package, ArrowRight, Layers, Clock, Crown } from 'lucide-react';

interface WelcomeModalProps {
  onOpenFirstPack: () => void;
  totalUniqueCards: number;
  totalCatalogCount: number;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  onOpenFirstPack,
  totalUniqueCards,
  totalCatalogCount,
}) => {
  const { welcomeModalState, dismissWelcomeModal, player, cooldown } = useAuth();

  if (welcomeModalState === 'NONE' || !player) {
    return null;
  }

  const isNewPlayer = welcomeModalState === 'NEW_PLAYER';

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="welcome-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#140205] border border-red-500/40 p-6 sm:p-10 shadow-2xl shadow-red-950/60 flex flex-col items-center text-center overflow-hidden"
      >
        {/* Background Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-b from-red-600/30 via-rose-900/15 to-transparent blur-3xl pointer-events-none" />

        {/* Top Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/70 border border-red-500/40 text-xs font-mono font-bold tracking-widest text-red-300 mb-4 shadow-inner">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>{isNewPlayer ? 'NEW CURATOR WELCOME' : 'ACTRESS VAULT ARCHIVE'}</span>
        </div>

        {/* Title */}
        <h2 className="relative z-10 text-2xl sm:text-4xl font-black font-serif tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-red-200 uppercase">
          {isNewPlayer
            ? 'ACTRESS CARD COLLECTION'
            : `WELCOME BACK, ${player.displayName || player.username}`}
        </h2>

        {/* Subtitle */}
        <p className="relative z-10 text-sm font-sans text-red-200/85 mt-2 max-w-sm">
          {isNewPlayer
            ? 'Your premier trading card journey begins now. Unseal booster packs and discover legendary actresses.'
            : 'Your card vault, booster allowances, and collection progress have been restored.'}
        </p>

        {/* Stat Grid */}
        <div className="relative z-10 w-full grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
          {/* Packs Available */}
          <div className="flex flex-col items-center p-3.5 rounded-2xl bg-black/60 border border-red-500/25">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1 font-bold">
              <Package className="w-3.5 h-3.5 text-red-400" />
              <span>Boosters Ready</span>
            </div>
            <div className="text-2xl font-black font-mono text-red-400">
              {cooldown.packsAvailable}{' '}
              <span className="text-xs text-neutral-400 font-normal">/ 5</span>
            </div>
          </div>

          {/* Cards Collected */}
          <div className="flex flex-col items-center p-3.5 rounded-2xl bg-black/60 border border-red-500/25">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1 font-bold">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Actresses Vault</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {totalUniqueCards}{' '}
              <span className="text-xs text-neutral-400 font-normal">/ {totalCatalogCount}</span>
            </div>
          </div>

          {/* Cooldown Status */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center p-3.5 rounded-2xl bg-black/60 border border-red-500/25">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Allowance</span>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-400">
              {cooldown.isCooldownActive
                ? formatSeconds(cooldown.cooldownRemainingSeconds)
                : 'Ready'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isNewPlayer ? (
          <button
            id="open-first-pack-welcome-btn"
            onClick={() => {
              soundManager.playButtonClick();
              dismissWelcomeModal();
              onOpenFirstPack();
            }}
            className="relative z-10 w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black font-serif tracking-[0.2em] text-sm uppercase shadow-xl shadow-red-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-red-400/40"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>OPEN YOUR FIRST BOOSTER</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        ) : (
          <button
            id="continue-journey-welcome-btn"
            onClick={() => {
              soundManager.playButtonClick();
              dismissWelcomeModal();
            }}
            className="relative z-10 w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold font-serif tracking-[0.18em] text-sm uppercase shadow-xl shadow-red-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-red-400/40"
          >
            <span>CONTINUE COLLECTION</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
