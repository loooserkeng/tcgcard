import { Rarity, RarityDetails } from '../types';

export const RARITIES: Record<Rarity, RarityDetails> = {
  COMMON: {
    name: 'COMMON',
    label: 'Common',
    color: '#f87171',
    textColor: 'text-red-200',
    borderColor: 'border-red-500/30',
    glowColor: 'rgba(239, 68, 68, 0.25)',
    bgGradient: 'from-[#1c060a] via-[#120305] to-[#0a0203]',
    foilType: 'none',
    audioFrequency: 330,
  },
  RARE: {
    name: 'RARE',
    label: 'Rare',
    color: '#ef4444',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/70',
    glowColor: 'rgba(239, 68, 68, 0.55)',
    bgGradient: 'from-[#2b080f] via-[#170407] to-[#0c0204]',
    foilType: 'silver',
    audioFrequency: 440,
  },
  SPECIAL: {
    name: 'SPECIAL',
    label: 'Special',
    color: '#ff2e5b',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-500',
    glowColor: 'rgba(255, 46, 91, 0.7)',
    bgGradient: 'from-[#3b0a15] via-[#1e050b] to-[#0e0205]',
    foilType: 'purple',
    audioFrequency: 554,
  },
  EPIC: {
    name: 'EPIC',
    label: 'Epic',
    color: '#dc2626',
    textColor: 'text-red-300',
    borderColor: 'border-red-500',
    glowColor: 'rgba(220, 38, 38, 0.85)',
    bgGradient: 'from-[#4a0b18] via-[#24060d] to-[#100205]',
    foilType: 'prism',
    audioFrequency: 659,
  },
  LEGENDARY: {
    name: 'LEGENDARY',
    label: 'Legendary',
    color: '#fbbf24',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(251, 191, 36, 0.85)',
    bgGradient: 'from-[#500c1a] via-[#2d0711] to-[#140206]',
    foilType: 'gold_celestial',
    audioFrequency: 880,
  },
  // Backwards compatibility mappings
  UNCOMMON: {
    name: 'UNCOMMON',
    label: 'Special',
    color: '#ff2e5b',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-500',
    glowColor: 'rgba(255, 46, 91, 0.7)',
    bgGradient: 'from-[#3b0a15] via-[#1e050b] to-[#0e0205]',
    foilType: 'purple',
    audioFrequency: 554,
  },
  ULTRA_RARE: {
    name: 'ULTRA_RARE',
    label: 'Epic',
    color: '#dc2626',
    textColor: 'text-red-300',
    borderColor: 'border-red-500',
    glowColor: 'rgba(220, 38, 38, 0.85)',
    bgGradient: 'from-[#4a0b18] via-[#24060d] to-[#100205]',
    foilType: 'prism',
    audioFrequency: 659,
  },
};

export const RARITY_DROP_RATES: Record<Rarity, number> = {
  COMMON: 0.50,
  RARE: 0.25,
  SPECIAL: 0.15,
  EPIC: 0.08,
  LEGENDARY: 0.02,
  UNCOMMON: 0.15,
  ULTRA_RARE: 0.08,
};

// Slot distribution rules for a booster pack pull
export const PACK_SLOT_CONFIGS: { slot: number; description: string; pool: Rarity[] }[] = [
  { slot: 1, description: 'Base Actress', pool: ['COMMON', 'RARE'] },
  { slot: 2, description: 'Base Actress', pool: ['COMMON', 'RARE'] },
  { slot: 3, description: 'Rising Star', pool: ['RARE', 'SPECIAL'] },
  { slot: 4, description: 'Featured Showcase', pool: ['RARE', 'SPECIAL', 'EPIC'] },
  { slot: 5, description: 'Crown Climax Slot', pool: ['SPECIAL', 'EPIC', 'LEGENDARY'] },
];

export function getRarityDetails(rarity: Rarity): RarityDetails {
  return RARITIES[rarity] || RARITIES.COMMON;
}

