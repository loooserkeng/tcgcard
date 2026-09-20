import React from 'react';
import { CollectedCard, UserProfile } from '../types';
import { RARITIES } from '../data/rarity';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/audio';
import {
  User,
  Crown,
  Sparkles,
  Package,
  Layers,
  ShieldCheck,
  LogOut,
  LogIn,
  Database,
  Clock,
  Heart,
} from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  collection: Record<string, CollectedCard>;
  totalCatalogCount: number;
  onOpenAuth: () => void;
  onOpenSetup: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  profile,
  collection,
  totalCatalogCount,
  onOpenAuth,
  onOpenSetup,
}) => {
  const { player, isAdmin, isConfigured, signOut, cooldown } = useAuth();

  const collectedList = Object.values(collection);
  const totalUnique = collectedList.length;
  const completionPercentage =
    totalCatalogCount > 0
      ? Math.min(100, Math.round((totalUnique / totalCatalogCount) * 100))
      : 0;

  // Counts by rarity
  const rarityCounts = {
    COMMON: collectedList.filter((c) => c.card.rarity === 'COMMON').length,
    RARE: collectedList.filter((c) => c.card.rarity === 'RARE' || c.card.rarity === 'UNCOMMON').length,
    SPECIAL: collectedList.filter((c) => c.card.rarity === 'SPECIAL').length,
    EPIC: collectedList.filter((c) => c.card.rarity === 'EPIC' || c.card.rarity === 'ULTRA_RARE').length,
    LEGENDARY: collectedList.filter((c) => c.card.rarity === 'LEGENDARY').length,
  };

  const getRank = () => {
    if (rarityCounts.LEGENDARY >= 2) return 'Master Curator';
    if (rarityCounts.LEGENDARY >= 1) return 'Premier Connoisseur';
    if (rarityCounts.EPIC >= 3) return 'Cinema Aficionado';
    if (rarityCounts.SPECIAL >= 3) return 'Spotlight Collector';
    if (totalUnique >= 3) return 'Enthusiast Scout';
    return 'Debut Collector';
  };

  const handleSignOut = async () => {
    soundManager.playButtonClick();
    await signOut();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="profile-screen"
      className="relative min-h-[calc(100dvh-4rem)] w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none"
    >
      {/* Ambient Red Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

      {/* Profile Card Header */}
      <div className="relative rounded-3xl bg-[#140205]/90 border border-red-500/30 p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8 overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with red glowing ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-xl p-0.5 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 flex items-center justify-center">
              {player ? (
                <div className="w-full h-full bg-[#1b0307] rounded-[14px] flex items-center justify-center text-3xl font-black text-white font-serif">
                  {player.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src={profile.avatar}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-mono font-black uppercase shadow-md">
              LVL {profile.level}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-bold tracking-widest text-red-400 uppercase">
                {player ? `COLLECTOR @${player.username}` : 'GUEST COLLECTOR'}
              </span>

              {/* Role badge */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>ADMINISTRATOR</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-600/20 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold uppercase">
                  <User className="w-3 h-3 text-red-400" />
                  <span>CURATOR</span>
                </span>
              )}

              {/* Cloud Sync Status */}
              <button
                onClick={onOpenSetup}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono cursor-pointer border ${
                  isConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-black/60 border-red-900/60 text-red-300/80'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>{isConfigured ? 'DATABASE SYNCED' : 'LOCAL CACHE MODE'}</span>
              </button>
            </div>

            <h1 className="text-3xl font-black font-serif uppercase tracking-wider text-white">
              {player?.displayName || player?.username || profile.name}
            </h1>

            <p className="text-xs font-mono text-amber-300 font-bold mt-1">
              Curator Title: {getRank()}
            </p>

            {/* Pack Allowance & Cooldown Summary */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border ${
                  cooldown.isCooldownActive
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-red-950/60 border-red-500/30 text-red-200'
                }`}
              >
                {cooldown.isCooldownActive ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>COOLDOWN: {formatTimer(cooldown.cooldownRemainingSeconds)} REMAINING</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3.5 h-3.5 text-red-400" />
                    <span>{cooldown.packsAvailable}/5 PACKS READY</span>
                  </>
                )}
              </div>
            </div>

            {/* Collection Completion Progress Bar */}
            <div className="mt-5 space-y-1.5 max-w-lg">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-red-200 font-bold">Actress Vault Completion</span>
                <span className="text-amber-300 font-bold font-mono">
                  {completionPercentage}% ({totalUnique} / {totalCatalogCount} Actresses)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-black/60 overflow-hidden p-0.5 border border-red-900/60">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-1000 shadow-sm shadow-red-500/50"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex flex-col gap-2 shrink-0 self-center sm:self-start">
            {player ? (
              <button
                id="profile-signout-btn"
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 hover:border-red-500/50 text-red-200 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOG OUT</span>
              </button>
            ) : (
              <button
                id="profile-signin-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-mono font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/40 transition-all border border-red-400/40"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN / REGISTER</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- STATS SUMMARY TILES --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#140205]/80 border border-red-500/25 text-center">
          <Package className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
          <span className="text-[10px] font-mono text-red-300 uppercase tracking-wider block font-bold">
            Packs Opened
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
            {player?.totalPacksOpened ?? profile.packsOpened}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140205]/80 border border-red-500/25 text-center">
          <Layers className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
          <span className="text-[10px] font-mono text-red-300 uppercase tracking-wider block font-bold">
            Actresses Unlocked
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
            {totalUnique}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140205]/80 border border-red-500/25 text-center">
          <Heart className="w-5 h-5 text-red-400 fill-red-400 mx-auto mb-1.5" />
          <span className="text-[10px] font-mono text-red-300 uppercase tracking-wider block font-bold">
            Epic / Ultra
          </span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-0.5 block">
            {rarityCounts.EPIC}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140205]/80 border border-red-500/25 text-center">
          <Crown className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
          <span className="text-[10px] font-mono text-red-300 uppercase tracking-wider block font-bold">
            Legendary
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-0.5 block">
            {rarityCounts.LEGENDARY}
          </span>
        </div>
      </div>

      {/* --- RARITY BREAKDOWN LIST --- */}
      <div className="rounded-2xl bg-[#140205]/80 border border-red-500/25 p-6">
        <h2 className="text-base font-bold font-serif uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <span>RARITY BREAKDOWN</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(RARITIES).map(([key, config]) => {
            const count = rarityCounts[key as keyof typeof rarityCounts] || 0;
            return (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-red-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.glowColor }}
                  />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {config.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-amber-300">{count}</span>
                  <span className="text-[10px] font-mono text-red-300/70">cards</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
