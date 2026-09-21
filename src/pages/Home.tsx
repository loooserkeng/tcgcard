import React, { useState } from 'react';
import { BoosterPack } from '../components/BoosterPack';
import { Card } from '../components/Card';
import { CollectedCard } from '../types';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/audio';
import { CooldownModal } from '../components/CooldownModal';
import {
  Sparkles,
  Layers,
  Package,
  Crown,
  ArrowRight,
  Clock,
  Lock,
  Trophy,
} from 'lucide-react';

interface HomeProps {
  onOpenPack: () => void;
  collection: Record<string, CollectedCard>;
  packsOpened: number;
  totalUniqueCards: number;
  totalCatalogCount: number;
  onNavigateTab: (tab: 'COLLECTION' | 'PACKS') => void;
  onSelectCard: (card: CollectedCard) => void;
}

export const Home: React.FC<HomeProps> = ({
  onOpenPack,
  collection,
  packsOpened,
  totalUniqueCards,
  totalCatalogCount,
  onNavigateTab,
  onSelectCard,
}) => {
  const { cooldown, player, openAuthModal } = useAuth();
  const [isCooldownModalOpen, setIsCooldownModalOpen] = useState(false);

  const collectedList = Object.values(collection);
  // Get recent 4 collected cards
  const recentCards = [...collectedList]
    .sort(
      (a, b) =>
        new Date(b.lastDiscoveredAt).getTime() - new Date(a.lastDiscoveredAt).getTime()
    )
    .slice(0, 4);

  const completionPercent = totalCatalogCount > 0
    ? Math.round((totalUniqueCards / totalCatalogCount) * 100)
    : 0;

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

  const handlePackClick = () => {
    if (!player) {
      soundManager.playButtonClick();
      openAuthModal('LOGIN');
      return;
    }

    if (cooldown.isCooldownActive || cooldown.packsAvailable <= 0) {
      soundManager.playCardFlip();
      setIsCooldownModalOpen(true);
      return;
    }

    soundManager.playPackClick();
    onOpenPack();
  };

  const packsAvail = cooldown.packsAvailable;
  const isCooldownActive = cooldown.isCooldownActive || packsAvail === 0;

  return (
    <div
      id="home-screen"
      className="relative min-h-[calc(100dvh-4rem)] w-full flex flex-col items-center justify-between py-6 px-4 select-none"
    >
      {/* Cinematic Red Atmospheric Lighting */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full bg-gradient-to-b from-red-600/20 via-rose-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* --- HERO HEADER: 1. BRANDING --- */}
      <div className="relative z-10 text-center max-w-3xl mt-2 sm:mt-4">
        {/* Crown Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-mono font-bold tracking-widest text-red-200 mb-3 shadow-lg shadow-red-950/50">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>SERIES 1 • PREMIER EDITION</span>
        </div>

        {/* Prominent App Title */}
        <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-[0.16em] text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-red-200 uppercase drop-shadow-md">
          ACTRESS CARD COLLECTION
        </h1>

        <p className="text-sm sm:text-base font-sans text-red-200/90 mt-2 max-w-xl mx-auto font-medium leading-relaxed">
          Open premier boosters, discover cinematic rarities, and curate your personal gallery of legendary actresses.
        </p>

        {/* --- 2. COLLECTION & PROGRESS STRIP --- */}
        <div className="mt-5 w-full max-w-xl mx-auto p-4 rounded-2xl bg-[#140205]/90 border border-red-500/30 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-200 mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-bold tracking-wider text-white uppercase">Vault Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-300 font-bold">
                {totalUniqueCards} / {totalCatalogCount} Actresses
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-600/40 border border-red-500/50 text-[11px] font-black text-amber-300">
                {completionPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-black/60 border border-red-900/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-700 shadow-sm shadow-red-500/50"
              style={{ width: `${Math.max(completionPercent, 4)}%` }}
            />
          </div>

          {/* Packs Available & Cooldown Meter */}
          <div className="mt-3 pt-3 border-t border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-red-400" />
              <span className="text-neutral-300 uppercase font-bold">Booster Packs:</span>
              <span className={`font-black ${isCooldownActive ? 'text-amber-400' : 'text-red-300'}`}>
                {packsAvail} / 1 AVAILABLE
              </span>
            </div>

            {/* 1 Indicator Pip */}
            <div className="flex items-center gap-1.5">
              {[1].map((slot) => {
                const isFilled = slot <= packsAvail;
                return (
                  <div
                    key={slot}
                    className={`w-3.5 h-3.5 rounded-md border transition-all ${
                      isFilled
                        ? 'bg-red-500 border-red-300 shadow-sm shadow-red-500/50 scale-100'
                        : 'bg-black/50 border-red-900/60 opacity-40 scale-95'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Cooldown live countdown if exhausted */}
          {isCooldownActive && (
            <div className="mt-2.5 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>
                NEXT 3 CARDS IN:{' '}
                <strong className="font-mono tracking-wider font-bold text-white">
                  {formatTimer(cooldown.cooldownRemainingSeconds)}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- 3. ONE MAIN ANIMATED BOOSTER PACK --- */}
      <div className="relative z-20 my-6 sm:my-8 flex flex-col items-center justify-center">
        <div className="relative">
          <BoosterPack onOpen={handlePackClick} />

          {/* Lock Overlay if Cooldown is Active */}
          {isCooldownActive && (
            <div
              onClick={() => setIsCooldownModalOpen(true)}
              className="absolute inset-0 z-30 rounded-3xl bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xl shadow-amber-500/20">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
              <span className="text-sm font-mono font-black uppercase tracking-widest text-amber-300">
                PACKS EXHAUSTED
              </span>
              <span className="text-xs font-mono text-neutral-300 mt-1">
                Cooldown: {formatTimer(cooldown.cooldownRemainingSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* Primary Call To Action Button */}
        <div className="mt-6 flex flex-col items-center gap-2">
          {isCooldownActive ? (
            <button
              id="open-pack-cooldown-btn"
              onClick={() => {
                soundManager.playButtonClick();
                setIsCooldownModalOpen(true);
              }}
              className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-red-950/80 border border-amber-500/50 text-amber-300 hover:text-amber-200 font-bold font-serif tracking-[0.2em] text-xs sm:text-sm uppercase shadow-lg shadow-black/50 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>COOLDOWN ACTIVE ({formatTimer(cooldown.cooldownRemainingSeconds)})</span>
            </button>
          ) : (
            <button
              id="open-pack-hero-btn"
              onClick={handlePackClick}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black font-serif tracking-[0.22em] text-sm sm:text-base uppercase shadow-2xl shadow-red-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-red-400/40"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>OPEN 3 CARDS</span>
            </button>
          )}

          {!player && (
            <span className="text-[11px] font-mono text-red-300/80 mt-1">
              Sign in or create account to save your collection permanently
            </span>
          )}
        </div>
      </div>

      {/* --- QUICK STATS OVERVIEW --- */}
      <div className="relative z-10 w-full max-w-3xl grid grid-cols-3 gap-3 p-3 rounded-2xl bg-[#140205]/80 border border-red-500/30 backdrop-blur-md mb-6">
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-300 uppercase tracking-wider font-bold">
            <Layers className="w-3.5 h-3.5 text-red-400" /> Unique Actresses
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
            {totalUniqueCards}{' '}
            <span className="text-xs text-red-300/70 font-normal">/ {totalCatalogCount}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-300 uppercase tracking-wider font-bold">
            <Package className="w-3.5 h-3.5 text-rose-400" /> Boosters Opened
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
            {player?.totalPacksOpened ?? packsOpened}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-red-950/40 border border-red-500/20">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-300 uppercase tracking-wider font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Vault Ratio
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">
            {completionPercent}%
          </div>
        </div>
      </div>

      {/* --- RECENT DISCOVERIES STRIP --- */}
      {recentCards.length > 0 && (
        <div className="relative z-10 w-full max-w-4xl pb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono font-bold tracking-widest text-red-200 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-400" /> Recently Discovered
            </span>
            <button
              onClick={() => onNavigateTab('COLLECTION')}
              className="text-xs font-mono text-red-300 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentCards.map((c) => (
              <div
                key={c.cardId}
                onClick={() => onSelectCard(c)}
                className="cursor-pointer hover:scale-102 transition-transform"
              >
                <Card card={c.card} copies={c.copies} size="sm" interactiveTilt={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cooldown Info Modal */}
      <CooldownModal
        isOpen={isCooldownModalOpen}
        onClose={() => setIsCooldownModalOpen(false)}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
