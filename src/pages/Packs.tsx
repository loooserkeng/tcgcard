import React, { useState } from 'react';
import { PackHistoryItem } from '../types';
import { AVAILABLE_PACKS, PackOption, PackType } from '../utils/packGenerator';
import { BoosterPack } from '../components/BoosterPack';
import { Card } from '../components/Card';
import { getRarityDetails } from '../data/rarity';
import { soundManager } from '../utils/audio';
import {
  Package,
  History,
  Sparkles,
  X,
  Calendar,
  Crown,
  Layers,
  Star,
} from 'lucide-react';

interface PacksProps {
  onOpenSpecificPack: (packType: PackType) => void;
  packHistory: PackHistoryItem[];
}

export const Packs: React.FC<PacksProps> = ({
  onOpenSpecificPack,
  packHistory,
}) => {
  const [inspectHistoryItem, setInspectHistoryItem] = useState<PackHistoryItem | null>(null);

  const mainPack = AVAILABLE_PACKS[0];

  const handleOpenMainPack = () => {
    soundManager.playPackClick();
    onOpenSpecificPack(mainPack.id);
  };

  return (
    <div
      id="packs-screen"
      className="relative min-h-[calc(100dvh-4rem)] w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 select-none"
    >
      {/* Ambient Red Glow */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 text-center max-w-xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-[10px] font-mono font-bold tracking-widest text-red-300 mb-2">
          <Package className="w-3 h-3 text-red-400" />
          <span>PREMIER BOOSTER DISPENSER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-widest text-white">
          ACTRESS BOOSTER VAULT
        </h1>
        <p className="text-xs sm:text-sm font-sans text-red-200/80 mt-1">
          Unseal the official Series 1 Premier Booster Pack. 5 cards per pack with guaranteed high-tier pulls.
        </p>
      </div>

      {/* --- SINGLE MAIN BOOSTER PACK HERO --- */}
      <div className="relative z-10 my-6 p-6 sm:p-8 rounded-3xl bg-[#140205]/90 border border-red-500/30 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-around gap-8">
        {/* Animated Pack Display */}
        <div className="shrink-0 flex flex-col items-center">
          <BoosterPack onOpen={handleOpenMainPack} />
        </div>

        {/* Pack Information & Instant Open CTA */}
        <div className="flex-1 max-w-md text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-widest uppercase bg-red-600/30 text-amber-300 border border-red-500/40">
              {mainPack.badge}
            </span>
            <span className="text-xs font-mono text-red-300 font-bold">5 ACTRESS CARDS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-wide text-white">
            {mainPack.name}
          </h2>

          <p className="text-sm text-red-200/90 mt-2 leading-relaxed">
            {mainPack.description}
          </p>

          {/* Rarity breakdown preview */}
          <div className="mt-4 p-3.5 rounded-xl bg-black/60 border border-red-500/25 space-y-2">
            <div className="text-[11px] font-mono font-bold text-red-300 uppercase flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Guaranteed Pull Tiers:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center gap-1 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span>Common / Rare (Cards 1-2)</span>
              </div>
              <div className="flex items-center gap-1 text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Rare / Special (Card 3)</span>
              </div>
              <div className="flex items-center gap-1 text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Special / Epic (Card 4)</span>
              </div>
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Epic / Legendary (Card 5)</span>
              </div>
            </div>
          </div>

          {/* Open Pack Button */}
          <button
            id="open-main-booster-btn"
            onClick={handleOpenMainPack}
            className="mt-6 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black font-serif tracking-[0.2em] text-sm uppercase shadow-xl shadow-red-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer border border-red-400/40"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>OPEN BOOSTER PACK</span>
          </button>
        </div>
      </div>

      {/* --- PACK HISTORY SECTION --- */}
      <div className="border-t border-red-500/20 pt-8 mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-red-400" />
            <h2 className="text-lg font-bold font-serif uppercase tracking-wider text-white">
              BOOSTER OPENING HISTORY
            </h2>
            <span className="text-xs font-mono text-red-300/80">
              ({packHistory.length} Opened)
            </span>
          </div>
        </div>

        {packHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#140205]/60 border border-red-500/20 text-center text-xs font-mono text-red-300/80">
            No packs opened yet. Unseal your premier booster pack above to start recording history.
          </div>
        ) : (
          <div className="space-y-3">
            {packHistory.map((item) => {
              const formattedDate = new Date(item.openedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundManager.playButtonClick();
                    setInspectHistoryItem(item);
                  }}
                  className="p-4 rounded-xl bg-[#140205]/80 border border-red-500/20 hover:border-red-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-red-950/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center font-mono font-bold text-sm text-red-300">
                      #{String(item.packNumber).padStart(3, '0')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-serif uppercase">
                        {item.packName || 'Premier Actress Booster Pack'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-red-300/70">
                        <Calendar className="w-3 h-3 text-red-400" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>5 Cards</span>
                      </div>
                    </div>
                  </div>

                  {/* Rarities Pill Strip */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.cards.map((card, idx) => {
                      const rInfo = getRarityDetails(card.rarity);
                      return (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase border"
                          style={{
                            backgroundColor: `${rInfo.color}20`,
                            borderColor: `${rInfo.color}50`,
                            color: rInfo.color,
                          }}
                        >
                          {rInfo.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INSPECT PACK HISTORY MODAL */}
      {inspectHistoryItem && (
        <div
          onClick={() => setInspectHistoryItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-3xl bg-[#140205] border border-red-500/40 p-6 shadow-2xl my-auto"
          >
            <div className="flex items-center justify-between border-b border-red-500/25 pb-4 mb-6">
              <div>
                <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                  Pack #{String(inspectHistoryItem.packNumber).padStart(3, '0')}
                </span>
                <h3 className="text-2xl font-black font-serif uppercase text-white">
                  {inspectHistoryItem.packName}
                </h3>
              </div>
              <button
                onClick={() => setInspectHistoryItem(null)}
                className="w-8 h-8 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/30 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5 Cards Display */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {inspectHistoryItem.cards.map((card, idx) => (
                <div key={idx} className="flex justify-center">
                  <Card card={card} size="sm" interactiveTilt={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
