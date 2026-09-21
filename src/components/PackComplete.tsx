import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActressCard } from '../types';
import { Card } from './Card';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Layers, RotateCcw } from 'lucide-react';

interface PackCompleteProps {
  cards: ActressCard[];
  knownCardIds: Set<string>;
  onAddToCollection: () => void;
  onOpenAnother: () => void;
  onViewCollection: () => void;
}

export const PackComplete: React.FC<PackCompleteProps> = ({
  cards,
  knownCardIds,
  onAddToCollection,
  onOpenAnother,
  onViewCollection,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ActressCard | null>(null);

  const newCardsCount = cards.filter((c) => !knownCardIds.has(c.id)).length;

  const handleAddCards = () => {
    soundManager.playCollectionAdded();
    setIsAdded(true);
    onAddToCollection();

    try {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#dc2626', '#fbbf24', '#ff2e5b', '#ffffff'],
      });
    } catch {}
  };

  // Rotation angles for the 3-card fan.
  const fanRotations = [-10, 0, 10];
  const fanXOffsets = [-90, 0, 90];

  return (
    <div
      id="pack-complete-screen"
      className="relative min-h-[92dvh] w-full flex flex-col items-center justify-between py-6 px-4 select-none overflow-hidden"
    >
      {/* Background ambient red lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-red-950/40 via-rose-900/30 to-amber-950/20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mt-2">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-xs font-mono font-bold tracking-widest text-red-300 mb-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>BOOSTER PACK UNSEALED</span>
        </motion.div>

        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-black font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-red-100 via-rose-200 to-amber-200 uppercase"
        >
          PACK COMPLETE
        </motion.h1>

        <p className="text-xs sm:text-sm font-mono text-neutral-300 mt-1">
          {newCardsCount > 0 ? (
            <span className="text-red-400 font-bold">
              {newCardsCount} NEW ACTRESS CARDS DISCOVERED
            </span>
          ) : (
            <span className="text-amber-400 font-bold">
              3 ACTRESS CARDS ADDED (DUPLICATE COPIES UPGRADED)
            </span>
          )}
        </p>
      </div>

      {/* --- 3-CARD FAN ARRANGEMENT --- */}
      <div className="relative z-20 my-auto w-full max-w-4xl h-[420px] flex items-center justify-center">
        {/* Desktop & Tablet Fan Display */}
        <div className="hidden sm:flex items-center justify-center relative w-full h-full">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id + idx}
              initial={{ y: 150, opacity: 0, rotate: 0 }}
              animate={
                isAdded
                  ? {
                      y: -200,
                      x: 250,
                      scale: 0.15,
                      opacity: 0,
                    }
                  : {
                      y: Math.abs(fanRotations[idx]) * 1.5,
                      x: fanXOffsets[idx] * 1.2,
                      rotate: fanRotations[idx],
                      opacity: 1,
                    }
              }
              transition={{
                duration: isAdded ? 0.6 : 0.7,
                delay: isAdded ? idx * 0.05 : idx * 0.08,
                ease: 'backOut',
              }}
              whileHover={{
                scale: 1.15,
                zIndex: 40,
                y: -30,
                rotate: 0,
                transition: { duration: 0.2 },
              }}
              onClick={() => setSelectedCard(card)}
              className="absolute cursor-pointer will-change-transform"
              style={{ zIndex: 10 + idx }}
            >
              <Card
                card={card}
                isNew={!knownCardIds.has(card.id)}
                size="sm"
                interactiveTilt={false}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll Grid */}
        <div className="sm:hidden flex items-center gap-3 overflow-x-auto p-4 w-full snap-x snap-mandatory">
          {cards.map((card, idx) => (
            <div
              key={card.id + idx}
              onClick={() => setSelectedCard(card)}
              className="shrink-0 snap-center"
            >
              <Card
                card={card}
                isNew={!knownCardIds.has(card.id)}
                size="sm"
                interactiveTilt={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="relative z-30 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pb-4">
        {!isAdded ? (
          <button
            id="add-to-collection-btn"
            onClick={handleAddCards}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 text-white font-black font-serif tracking-widest text-sm uppercase shadow-xl shadow-red-600/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>COLLECT TO VAULT</span>
          </button>
        ) : (
          <div className="w-full flex flex-col sm:flex-row items-center gap-3">
            <button
              id="view-collection-btn"
              onClick={onViewCollection}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs font-mono tracking-widest uppercase transition-all shadow-lg shadow-red-600/40 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>VIEW COLLECTION</span>
            </button>

            <button
              id="open-another-pack-btn"
              onClick={onOpenAnother}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-500/30 text-white font-bold text-xs font-mono tracking-widest uppercase transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>OPEN ANOTHER BOOSTER</span>
            </button>
          </div>
        )}
      </div>

      {/* Inspection Modal for clicked card in the fan */}
      {selectedCard && (
        <div
          id="preview-card-modal"
          onClick={() => setSelectedCard(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-4"
          >
            <Card card={selectedCard} size="lg" interactiveTilt={true} />
            <button
              onClick={() => setSelectedCard(null)}
              className="px-6 py-2 rounded-full bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-xs font-mono font-bold text-white cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
