import React, { useEffect } from 'react';
import { CollectedCard } from '../types';
import { Card } from './Card';
import { getRarityDetails } from '../data/rarity';
import { soundManager } from '../utils/audio';
import { X, ChevronLeft, ChevronRight, Calendar, Layers, Film, Star, Heart } from 'lucide-react';

interface CardModalProps {
  collectedCard: CollectedCard;
  allCollected: CollectedCard[];
  onClose: () => void;
  onSelectCard: (card: CollectedCard) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  collectedCard,
  allCollected,
  onClose,
  onSelectCard,
}) => {
  const currentIndex = allCollected.findIndex((c) => c.cardId === collectedCard.cardId);
  const { card, copies, firstDiscoveredAt } = collectedCard;
  const rarityInfo = getRarityDetails(card.rarity);

  const handlePrev = () => {
    if (currentIndex > 0) {
      soundManager.playCardSwipe();
      onSelectCard(allCollected[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allCollected.length - 1) {
      soundManager.playCardSwipe();
      onSelectCard(allCollected[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allCollected]);

  const formattedDate = firstDiscoveredAt
    ? new Date(firstDiscoveredAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div
      id="card-detail-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-3xl bg-[#140205]/95 border-2 border-red-500/40 p-6 shadow-2xl flex flex-col md:flex-row items-center gap-8"
        style={{
          boxShadow: `0 25px 60px -15px rgba(0,0,0,0.95), 0 0 35px ${rarityInfo.glowColor}`,
        }}
      >
        {/* Close Button */}
        <button
          id="close-card-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 flex items-center justify-center text-red-200 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Card Rendering with 3D Tilt */}
        <div className="shrink-0 flex items-center justify-center">
          <Card card={card} copies={copies} size="lg" interactiveTilt={true} />
        </div>

        {/* Right: Detailed Metadata and Lore */}
        <div className="flex-1 flex flex-col justify-between self-stretch">
          <div>
            {/* Header info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-black text-red-400">
                {card.cardNumber}
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest border"
                style={{
                  backgroundColor: `${rarityInfo.color}22`,
                  borderColor: `${rarityInfo.color}66`,
                  color: rarityInfo.color,
                }}
              >
                {rarityInfo.label}
              </span>
              <span className="text-xs font-mono text-red-300/80">
                • Series I
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-wide text-white">
              {card.name}
            </h2>

            {/* Date of Birth & Age */}
            <div className="flex items-center gap-3 text-xs font-mono text-red-300 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                {card.dateOfBirth}
              </span>
              <span>•</span>
              <span className="font-bold text-white">Age {card.age}</span>
            </div>

            {/* Beauty Rate Rating Bar */}
            <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="flex items-center gap-1 text-red-300 font-bold uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Beauty Rate
                </span>
                <span className="text-white font-black text-sm">
                  {card.beautyRate || 95} / 100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-red-950 border border-red-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full"
                  style={{ width: `${card.beautyRate || 95}%` }}
                />
              </div>
            </div>

            {/* Movies Filmography */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-mono uppercase text-red-400 tracking-wider flex items-center gap-1.5 font-bold">
                <Film className="w-3.5 h-3.5 text-red-400" />
                Featured Movies & Masterpieces
              </span>
              <div className="flex flex-wrap gap-1.5">
                {card.movies && card.movies.length > 0 ? (
                  card.movies.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/30 text-xs font-medium text-neutral-200"
                    >
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400 italic">Leading Actress</span>
                )}
              </div>
            </div>

            {/* Quote / Biography */}
            {card.quote && (
              <div className="mt-4 p-3 rounded-xl bg-black/40 border border-red-500/20">
                <p className="text-xs text-neutral-300 italic font-serif leading-relaxed">
                  "{card.quote}"
                </p>
              </div>
            )}

            {/* Collection Metadata */}
            <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-red-500/20 text-xs font-mono">
              <div className="flex items-center gap-2 text-red-200">
                <Layers className="w-4 h-4 text-red-400" />
                <span>
                  Copies in Vault:{' '}
                  <strong className="text-white font-bold">{copies}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-red-200">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>
                  Discovered:{' '}
                  <strong className="text-white font-bold">{formattedDate}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation controls (Previous / Next) */}
          <div className="mt-6 flex items-center justify-between pt-3 border-t border-red-500/20">
            <button
              id="card-modal-prev-btn"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all ${
                currentIndex <= 0
                  ? 'opacity-30 cursor-not-allowed bg-red-950/20 text-red-800'
                  : 'bg-red-950/60 hover:bg-red-900/60 text-white cursor-pointer border border-red-500/30'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>

            <span className="text-xs font-mono text-red-300/80">
              {currentIndex + 1} of {allCollected.length}
            </span>

            <button
              id="card-modal-next-btn"
              onClick={handleNext}
              disabled={currentIndex >= allCollected.length - 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all ${
                currentIndex >= allCollected.length - 1
                  ? 'opacity-30 cursor-not-allowed bg-red-950/20 text-red-800'
                  : 'bg-red-950/60 hover:bg-red-900/60 text-white cursor-pointer border border-red-500/30'
              }`}
            >
              <span>NEXT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
