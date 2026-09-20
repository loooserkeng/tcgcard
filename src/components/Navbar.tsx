import React from 'react';
import { ActiveTab } from '../types';
import { soundManager } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Layers,
  Package,
  User,
  Settings,
  Volume2,
  VolumeX,
  Music,
  PlusCircle,
  Sparkles,
  Crown,
  ShieldCheck,
  LogIn,
  LogOut,
  Clock,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onOpenAddCard: () => void;
  onOpenAuth: () => void;
  onOpenSetup: () => void;
  totalCollectedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  onOpenAddCard,
  onOpenAuth,
  totalCollectedCount,
}) => {
  const { player, isAdmin, cooldown, signOut } = useAuth();

  const handleNavClick = (tab: ActiveTab) => {
    soundManager.playButtonClick();
    onTabChange(tab);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'HOME', label: 'HOME', icon: Home },
    { id: 'COLLECTION', label: 'COLLECTION', icon: Layers },
    { id: 'PACKS', label: 'BOOSTER PACKS', icon: Package },
    { id: 'PROFILE', label: 'PROFILE', icon: User },
    { id: 'SETTINGS', label: 'SETTINGS', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ id: 'ADMIN', label: 'ADMIN', icon: ShieldCheck });
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* DESKTOP TOP BAR */}
      <header
        id="desktop-navbar"
        className="hidden md:flex fixed top-0 inset-x-0 z-40 h-16 items-center justify-between px-6 bg-[#0c0204]/90 backdrop-blur-md border-b border-red-500/25 select-none"
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('HOME')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 p-0.5 shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-[#140205] flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            </div>
          </div>
          <div>
            <div className="font-serif font-black tracking-[0.16em] text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-amber-200 uppercase">
              ACTRESS CARD COLLECTION
            </div>
            <div className="text-[9px] font-mono tracking-widest text-red-400 font-bold flex items-center gap-1.5">
              <span>DIGITAL PREMIER TCG</span>
              {isAdmin && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[8px] font-black">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav className="flex items-center gap-1 p-1 rounded-2xl bg-black/50 border border-red-500/20 backdrop-blur-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isItemAdmin = item.id === 'ADMIN';

            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id.toLowerCase()}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? isItemAdmin
                      ? 'text-amber-300 bg-amber-500/20 shadow-sm border border-amber-500/30'
                      : 'text-white bg-red-600/40 shadow-sm shadow-red-600/30 border border-red-500/40'
                    : isItemAdmin
                    ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-neutral-400 hover:text-white hover:bg-red-950/40'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? isItemAdmin
                        ? 'text-amber-400'
                        : 'text-red-400'
                      : isItemAdmin
                      ? 'text-amber-400/70'
                      : ''
                  }`}
                />
                <span>{item.label}</span>
                {item.id === 'COLLECTION' && totalCollectedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-red-600/60 text-red-100 border border-red-400/30">
                    {totalCollectedCount}
                  </span>
                )}
                {isActive && (
                  <span
                    className={`absolute bottom-0 inset-x-3 h-0.5 rounded-full ${
                      isItemAdmin
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Booster Status Pill */}
          <div
            title="Available booster packs"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold ${
              cooldown.isCooldownActive
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-red-950/40 border-red-500/30 text-red-200'
            }`}
          >
            {cooldown.isCooldownActive ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatTimer(cooldown.cooldownRemainingSeconds)}</span>
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5 text-red-400" />
                <span>{cooldown.packsAvailable}/5 PACKS</span>
              </>
            )}
          </div>

          {/* ADMIN ONLY: Add Actress Card button */}
          {isAdmin && (
            <button
              id="open-add-card-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onOpenAddCard();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-400/40 text-red-300 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>NEW CARD</span>
            </button>
          )}

          {/* Sound FX Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={() => {
              onToggleSound();
              soundManager.playButtonClick();
            }}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-red-950/60 border-red-500/40 text-red-200'
                : 'bg-black/50 border-white/10 text-neutral-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Music Toggle */}
          <button
            id="toggle-music-btn"
            onClick={() => {
              onToggleMusic();
              soundManager.playButtonClick();
            }}
            title={musicEnabled ? 'Pause Music' : 'Play Ambient Music'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              musicEnabled
                ? 'bg-red-600/25 border-red-400/40 text-red-200'
                : 'bg-black/50 border-white/10 text-neutral-500'
            }`}
          >
            <Music className={`w-4 h-4 ${musicEnabled ? 'text-red-400 animate-pulse' : ''}`} />
          </button>

          {/* Player Sign In / Profile / Logout */}
          {player ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick('PROFILE')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-500/30 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-[11px] font-black text-white">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-mono font-bold text-white max-w-[90px] truncate">
                  {player.displayName || player.username}
                </span>
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  signOut();
                }}
                title="Log out of account"
                className="w-9 h-9 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 flex items-center justify-center text-red-300 hover:text-white transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="header-signin-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-mono font-black tracking-wider transition-all cursor-pointer shadow-md shadow-red-600/30"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div
        id="mobile-navbar"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-[#0d0204]/95 backdrop-blur-lg border-t border-red-500/25 flex items-center justify-around px-2 select-none"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isItemAdmin = item.id === 'ADMIN';

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? isItemAdmin
                    ? 'text-amber-400'
                    : 'text-red-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-mono font-bold tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE TOP COMPACT BAR */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-[#0d0204]/95 backdrop-blur-md border-b border-red-500/25 flex items-center justify-between px-3 select-none">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="font-serif font-black text-xs tracking-wider text-white uppercase">
            ACTRESS CARDS
          </span>
          {isAdmin && (
            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[8px] font-bold font-mono">
              ADMIN
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Packs Indicator on mobile */}
          <div className="px-2 py-1 rounded-lg bg-red-950/50 border border-red-500/30 text-[10px] font-mono text-red-200">
            {cooldown.isCooldownActive ? (
              <span className="text-amber-400 font-bold">{formatTimer(cooldown.cooldownRemainingSeconds)}</span>
            ) : (
              <span>{cooldown.packsAvailable}/5 PKS</span>
            )}
          </div>

          {/* ADMIN ONLY Add card button on mobile */}
          {isAdmin && (
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenAddCard();
              }}
              className="p-1.5 rounded-lg bg-red-600/30 border border-red-400/40 text-red-200 text-[10px] font-mono font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          )}

          {/* Auth button on mobile */}
          {player ? (
            <button
              onClick={() => handleNavClick('PROFILE')}
              className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-[10px] font-black text-white"
            >
              {player.username.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-mono font-black"
            >
              LOGIN
            </button>
          )}

          <button
            onClick={() => {
              onToggleSound();
              soundManager.playButtonClick();
            }}
            className="p-1.5 rounded-lg bg-red-950/60 text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );
};
