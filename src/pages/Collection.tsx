import React, { useState, useMemo } from 'react';
import { CollectedCard, Rarity } from '../types';
import { Card } from '../components/Card';
import { RARITIES } from '../data/rarity';
import { soundManager } from '../utils/audio';
import {
  Layers,
  Sparkles,
  Search,
  PackageOpen,
  ArrowUpDown,
  Trophy,
  Crown,
  Star,
} from 'lucide-react';

interface CollectionProps {
  collection: Record<string, CollectedCard>;
  packsOpened: number;
  totalCatalogCount: number;
  onOpenFirstPack: () => void;
  onSelectCard: (card: CollectedCard) => void;
}

export const Collection: React.FC<CollectionProps> = ({
  collection,
  packsOpened,
  totalCatalogCount,
  onOpenFirstPack,
  onSelectCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'number' | 'beauty' | 'rarity' | 'copies' | 'name'>('number');

  const collectedList = useMemo(() => Object.values(collection), [collection]);
  const totalCardsInVault = useMemo(
    () => collectedList.reduce((sum, item) => sum + item.copies, 0),
    [collectedList]
  );

  const completionPercent = totalCatalogCount > 0
    ? Math.round((collectedList.length / totalCatalogCount) * 100)
    : 0;

  // Rarity weight for sorting
  const rarityWeights: Record<Rarity, number> = {
    LEGENDARY: 5,
    EPIC: 4,
    ULTRA_RARE: 4,
    SPECIAL: 3,
    RARE: 2,
    UNCOMMON: 2,
    COMMON: 1,
  };

  // Primary 5 rarities explicitly defined
  const rarityFilterKeys: (Rarity | 'ALL')[] = ['ALL', 'COMMON', 'RARE', 'SPECIAL', 'EPIC', 'LEGENDARY'];

  // Filtered and sorted list
  const filteredCards = useMemo(() => {
    return collectedList
      .filter((item) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.card.name.toLowerCase().includes(query) ||
          item.card.cardNumber.toLowerCase().includes(query) ||
          (item.card.movies && item.card.movies.some((m) => m.toLowerCase().includes(query)));

        let matchesRarity = selectedRarity === 'ALL';
        if (!matchesRarity) {
          if (selectedRarity === 'SPECIAL') {
            matchesRarity = item.card.rarity === 'SPECIAL' || item.card.rarity === 'UNCOMMON';
          } else if (selectedRarity === 'EPIC') {
            matchesRarity = item.card.rarity === 'EPIC' || item.card.rarity === 'ULTRA_RARE';
          } else {
            matchesRarity = item.card.rarity === selectedRarity;
          }
        }

        return matchesSearch && matchesRarity;
      })
      .sort((a, b) => {
        if (sortBy === 'number') {
          return a.card.cardNumber.localeCompare(b.card.cardNumber);
        }
        if (sortBy === 'beauty') {
          return (b.card.beautyRate || 0) - (a.card.beautyRate || 0);
        }
        if (sortBy === 'rarity') {
          return (
            (rarityWeights[b.card.rarity] || 0) - (rarityWeights[a.card.rarity] || 0)
          );
        }
        if (sortBy === 'copies') {
          return b.copies - a.copies;
        }
        if (sortBy === 'name') {
          return a.card.name.localeCompare(b.card.name);
        }
        return 0;
      });
  }, [collectedList, searchQuery, selectedRarity, sortBy]);

  const handleCardClick = (item: CollectedCard) => {
    soundManager.playButtonClick();
    onSelectCard(item);
  };

  return (
    <div
      id="collection-screen"
      className="relative min-h-[calc(100dvh-4rem)] w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none"
    >
      {/* Ambient Red Glow Behind Header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-gradient-to-b from-red-600/15 via-rose-950/10 to-transparent blur-3xl pointer-events-none" />

      {/* --- HEADER --- */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-red-500/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[10px] font-mono font-bold tracking-widest text-red-300 mb-2">
            <Layers className="w-3 h-3 text-red-400" />
            <span>ACTRESS GALLERY VAULT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif uppercase tracking-widest text-white">
            MY ACTRESS COLLECTION
          </h1>
          <p className="text-xs sm:text-sm font-sans text-red-200/80 mt-1">
            Browse, inspect, and filter your unlocked actress trading cards.
          </p>
        </div>

        {/* Top Stats Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 sm:px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-center">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">
              Total Cards
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-white">
              {totalCardsInVault}
            </span>
          </div>

          <div className="px-3 sm:px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-center">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">
              Unique Actresses
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-300">
              {collectedList.length}{' '}
              <span className="text-xs text-red-400 font-normal">
                / {totalCatalogCount}
              </span>
            </span>
          </div>

          <div className="px-3 sm:px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-center">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">
              Completion
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-white">
              {completionPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* --- PROGRESS BAR STRIP --- */}
      <div className="mb-6 p-4 rounded-2xl bg-[#140205]/80 border border-red-500/25 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-neutral-300 flex items-center gap-1.5 font-bold uppercase">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Collection Album Completion
          </span>
          <span className="text-red-300 font-bold">
            {collectedList.length} of {totalCatalogCount} Actresses Collected ({completionPercent}%)
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-black/70 border border-red-950 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-700 shadow-sm shadow-red-500/50"
            style={{ width: `${Math.max(completionPercent, 4)}%` }}
          />
        </div>
      </div>

      {/* --- EMPTY STATE --- */}
      {collectedList.length === 0 ? (
        <div
          id="empty-collection-state"
          className="flex flex-col items-center justify-center p-12 my-12 rounded-3xl bg-[#140205]/90 border border-red-500/30 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl"
        >
          <div className="relative w-24 h-24 rounded-full bg-red-950/70 border border-red-500/40 flex items-center justify-center mb-6 shadow-inner animate-pulse">
            <div className="absolute inset-0 rounded-full border border-red-400/30 animate-ping" />
            <PackageOpen className="w-12 h-12 text-red-400" />
          </div>

          <h2 className="text-2xl font-black font-serif uppercase tracking-wider text-white">
            YOUR VAULT IS EMPTY
          </h2>
          <p className="text-sm font-sans text-red-200/80 mt-2 max-w-xs leading-relaxed">
            Open your premier booster pack to discover your first collectible Actress Cards.
          </p>

          <button
            id="open-first-pack-btn"
            onClick={onOpenFirstPack}
            className="mt-6 flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 text-white font-black font-serif tracking-widest text-sm uppercase shadow-xl shadow-red-600/40 cursor-pointer hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>OPEN FIRST BOOSTER</span>
          </button>
        </div>
      ) : (
        <>
          {/* --- SEARCH & SORT BAR --- */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-collection-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actress name, movie, card #..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-xs font-mono text-white placeholder-red-300/40 focus:outline-hidden focus:border-red-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-xs font-mono text-red-200">
                <ArrowUpDown className="w-3.5 h-3.5 text-red-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="number" className="bg-[#140205] text-white">
                    Sort: Card #
                  </option>
                  <option value="beauty" className="bg-[#140205] text-white">
                    Sort: Beauty Rate (Highest)
                  </option>
                  <option value="rarity" className="bg-[#140205] text-white">
                    Sort: Rarity (Highest)
                  </option>
                  <option value="copies" className="bg-[#140205] text-white">
                    Sort: Copies (Most)
                  </option>
                  <option value="name" className="bg-[#140205] text-white">
                    Sort: Name (A-Z)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* --- 5 RARITY PILL FILTERS --- */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
            {rarityFilterKeys.map((rKey) => {
              const isAll = rKey === 'ALL';
              const isSelected = selectedRarity === rKey;
              let count = 0;

              if (isAll) {
                count = collectedList.length;
              } else if (rKey === 'SPECIAL') {
                count = collectedList.filter((item) => item.card.rarity === 'SPECIAL' || item.card.rarity === 'UNCOMMON').length;
              } else if (rKey === 'EPIC') {
                count = collectedList.filter((item) => item.card.rarity === 'EPIC' || item.card.rarity === 'ULTRA_RARE').length;
              } else {
                count = collectedList.filter((item) => item.card.rarity === rKey).length;
              }

              const label = isAll ? 'ALL' : rKey === 'COMMON' ? 'COMMON' : rKey === 'RARE' ? 'RARE' : rKey === 'SPECIAL' ? 'SPECIAL' : rKey === 'EPIC' ? 'EPIC' : 'LEGENDARY';

              return (
                <button
                  key={rKey}
                  onClick={() => setSelectedRarity(rKey)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400 shadow-md shadow-red-600/40 scale-105'
                      : 'bg-red-950/40 hover:bg-red-900/50 text-red-300 border-red-500/30'
                  }`}
                >
                  {rKey === 'LEGENDARY' && <Crown className="w-3 h-3 text-amber-400" />}
                  {rKey === 'SPECIAL' && <Star className="w-3 h-3 text-rose-400" />}
                  <span>{label}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* --- CARDS GRID --- */}
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredCards.map((item) => (
                <div
                  key={item.cardId}
                  onClick={() => handleCardClick(item)}
                  className="flex justify-center transition-transform duration-200 hover:-translate-y-2 cursor-pointer"
                >
                  <Card
                    card={item.card}
                    copies={item.copies}
                    size="sm"
                    interactiveTilt={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-red-300/80 font-mono text-sm border border-red-500/20 rounded-2xl bg-red-950/20 my-8">
              No Actress Cards match your search query or selected rarity filter.
            </div>
          )}
        </>
      )}
    </div>
  );
};
