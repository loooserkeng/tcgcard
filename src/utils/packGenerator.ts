import { PersonCard, Rarity } from '../types';
import { getAllAvailableCards } from './storage';

export type PackType = 'STANDARD';

export interface PackOption {
  id: PackType;
  name: string;
  badge: string;
  description: string;
  foilTheme: string;
}

// Exactly ONE main booster pack opening option as requested
export const AVAILABLE_PACKS: PackOption[] = [
  {
    id: 'STANDARD',
    name: 'Premier Actress Booster Pack',
    badge: 'Premier Edition',
    description: 'Contains 5 collectible Actress cards with elevated chances for Special, Epic, or Legendary pulls.',
    foilTheme: 'crimson-ruby',
  },
];

// Helper to pick a rarity by weighted probability
function pickRarityFromPool(pool: Rarity[]): Rarity {
  const weights: Record<Rarity, number> = {
    COMMON: 48,
    RARE: 28,
    UNCOMMON: 28, // mapped to Rare/Special
    SPECIAL: 14,
    EPIC: 7,
    ULTRA_RARE: 7, // mapped to Epic
    LEGENDARY: 3,
  };

  const filteredPool = pool.filter((r) => weights[r] !== undefined);
  const totalWeight = filteredPool.reduce((sum, r) => sum + (weights[r] || 10), 0);

  let rand = Math.random() * totalWeight;
  for (const r of filteredPool) {
    const w = weights[r] || 10;
    if (rand < w) {
      return r;
    }
    rand -= w;
  }
  return filteredPool[0] || 'COMMON';
}

export function generatePack(packType: PackType = 'STANDARD'): PersonCard[] {
  const allCards = getAllAvailableCards();
  const selectedCards: PersonCard[] = [];
  const pickedIds = new Set<string>();

  // Three-card drop: one-hour cooldown after each successful opening.
  const slotRarities: Rarity[] = [
    pickRarityFromPool(['COMMON', 'RARE']),
    pickRarityFromPool(['RARE', 'SPECIAL', 'EPIC']),
    pickRarityFromPool(['SPECIAL', 'EPIC', 'LEGENDARY']),
  ];

  for (let i = 0; i < 3; i++) {
    const targetRarity = slotRarities[i];
    // Find unpicked cards matching target rarity
    let candidates = allCards.filter(
      (c) => c.rarity === targetRarity && !pickedIds.has(c.id)
    );

    // Fallback if no exact match
    if (candidates.length === 0) {
      candidates = allCards.filter((c) => !pickedIds.has(c.id));
    }
    if (candidates.length === 0) {
      candidates = allCards;
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    pickedIds.add(chosen.id);
    selectedCards.push(chosen);
  }

  return selectedCards;
}
