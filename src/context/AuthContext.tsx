import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CooldownState, Player } from '../types';
import { getSupabase, isSupabaseConfigured } from '../utils/supabase';

type Mode = 'LOGIN' | 'SIGNUP';
type WelcomeModalState = 'NONE' | 'NEW_PLAYER' | 'RETURNING_PLAYER';

type AuthValue = {
  player: Player | null;
  isAdmin: boolean;
  isConfigured: boolean;
  cooldown: CooldownState;
  welcomeModalState: WelcomeModalState;
  isAuthModalOpen: boolean;
  authModalMode: Mode;
  openAuthModal: (m?: Mode) => void;
  closeAuthModal: () => void;
  dismissWelcomeModal: () => void;
  updatePlayerState: (p: Player, c: CooldownState) => void;
  signIn: (u: string, p: string) => Promise<{ error: string | null }>;
  signUp: (u: string, p: string, c: string, d: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const C = createContext<AuthValue | null>(null);
const SESSION_KEY = 'pcc_current_player';
const PLAYER_KEY = (u: string) => 'pcc_player_' + u.trim().toLowerCase();
const PLAYER_OBJECT_KEY = (id: string) => 'pcc_player_obj_' + id;
const PASSWORD_KEY = (u: string) => 'pcc_password_' + u.trim().toLowerCase();

const defaultCooldown = (): CooldownState => ({
  packsAvailable: 1,
  maxPacks: 1,
  cooldownRemainingSeconds: 0,
  isCooldownActive: false,
  cooldownUntil: null,
});

function calculateCooldown(p: Player): CooldownState {
  const last = p.lastPackBatchAt ? new Date(p.lastPackBatchAt).getTime() : 0;
  const elapsed = last ? Math.floor((Date.now() - last) / 1000) : 3600;
  if (p.packsInCurrentBatch >= 1 && elapsed < 3600) {
    const remaining = Math.max(0, 3600 - elapsed);
    return {
      packsAvailable: 0,
      maxPacks: 1,
      cooldownRemainingSeconds: remaining,
      isCooldownActive: remaining > 0,
      cooldownUntil: new Date(last + 3600000).toISOString(),
    };
  }
  if (p.packsInCurrentBatch >= 1 && elapsed >= 3600) {
    const reset = { ...p, packsInCurrentBatch: 0, lastPackBatchAt: null };
    localStorage.setItem(PLAYER_KEY(p.username), JSON.stringify(reset));
    localStorage.setItem(PLAYER_OBJECT_KEY(reset.id), JSON.stringify(reset));
    return defaultCooldown();
  }
  return {
    packsAvailable: Math.max(0, 1 - p.packsInCurrentBatch),
    maxPacks: 1,
    cooldownRemainingSeconds: 0,
    isCooldownActive: false,
    cooldownUntil: null,
  };
}

function makePlayer(username: string, displayName?: string): Player {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    username: username.trim(),
    usernameNormalized: username.trim().toLowerCase(),
    displayName: displayName?.trim() || username.trim(),
    role: 'USER',
    createdAt: now,
    lastLoginAt: now,
    lastPackBatchAt: null,
    packsInCurrentBatch: 0,
    totalPacksOpened: 0,
    isActive: true,
  };
}

function loadCurrentPlayer(): Player | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const raw = localStorage.getItem(PLAYER_OBJECT_KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(() => loadCurrentPlayer());
  const [cooldown, setCooldown] = useState<CooldownState>(() => {
    const p = loadCurrentPlayer();
    return p ? calculateCooldown(p) : defaultCooldown();
  });
  const [welcomeModalState, setWelcomeModalState] = useState<WelcomeModalState>('NONE');
  const [isAuthModalOpen, setOpen] = useState(false);
  const [authModalMode, setMode] = useState<Mode>('LOGIN');

  useEffect(() => {
    if (!player) {
      localStorage.removeItem(SESSION_KEY);
      setCooldown(defaultCooldown());
      setWelcomeModalState('NONE');
      return;
    }

    const refreshed = { ...player, lastLoginAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, refreshed.id);
    localStorage.setItem(PLAYER_OBJECT_KEY(refreshed.id), JSON.stringify(refreshed));
    localStorage.setItem(PLAYER_KEY(refreshed.username), JSON.stringify(refreshed));

    const nextCooldown = calculateCooldown(refreshed);
    setCooldown(nextCooldown);

    const hasSeenWelcome = localStorage.getItem('pcc_welcome_seen_' + refreshed.id) === '1';
    const hasProgress =
      refreshed.totalPacksOpened > 0 ||
      Object.keys(readCollection(refreshed.id)).length > 0;

    setWelcomeModalState(
      hasSeenWelcome ? 'NONE' : hasProgress ? 'RETURNING_PLAYER' : 'NEW_PLAYER'
    );
  }, [player?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCooldown((current) => {
        if (current.cooldownRemainingSeconds <= 0) return current;
        const remaining = Math.max(0, current.cooldownRemainingSeconds - 1);
        return {
          ...current,
          cooldownRemainingSeconds: remaining,
          isCooldownActive: remaining > 0,
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const signIn = async (username: string, password: string) => {
    const normalized = username.trim().toLowerCase();
    if (!normalized || !password) return { error: 'Username and password are required.' };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase!.rpc('login_player', {
          p_username: username.trim(),
          p_password: password,
        });
        if (error) return { error: error.message || 'Login failed.' };
        if (!data?.success) return { error: data?.error || 'Invalid username or password.' };

        const raw = data.player || {};
        const p: Player = {
          id: raw.id,
          username: raw.username,
          usernameNormalized: (raw.username || '').toLowerCase(),
          displayName: raw.display_name ?? raw.displayName ?? raw.username,
          role: raw.role === 'ADMIN' ? 'ADMIN' : 'USER',
          createdAt: raw.created_at || new Date().toISOString(),
          lastLoginAt: raw.last_login_at || new Date().toISOString(),
          lastPackBatchAt: raw.last_pack_batch_at ?? null,
          packsInCurrentBatch: Number(raw.packs_in_current_batch ?? 5),
          totalPacksOpened: Number(raw.total_packs_opened ?? 0),
          isActive: raw.is_active !== false,
        };
        localStorage.setItem('pcc_session', JSON.stringify({ token: data.session_token || '' }));
        localStorage.setItem(SESSION_KEY, p.id);
        localStorage.setItem(PLAYER_OBJECT_KEY(p.id), JSON.stringify(p));
        localStorage.setItem(PLAYER_KEY(p.username), JSON.stringify(p));
        setPlayer(p);
        return { error: null };
      } catch (e: any) {
        return { error: e?.message || 'Authentication service unavailable.' };
      }
    }

    const raw = localStorage.getItem(PLAYER_KEY(normalized));
    if (!raw) return { error: 'Invalid username or password.' };
    try {
      const savedPassword = localStorage.getItem(PASSWORD_KEY(normalized));
      if (savedPassword !== null && savedPassword !== password) return { error: 'Invalid username or password.' };
      const p = JSON.parse(raw) as Player;
      if (p.isActive === false) return { error: 'This account is inactive. Contact an administrator.' };
      if (savedPassword === null) localStorage.setItem(PASSWORD_KEY(normalized), password);
      setPlayer({ ...p, lastLoginAt: new Date().toISOString() });
      return { error: null };
    } catch {
      return { error: 'Unable to load this account. Please try again.' };
    }
  };

  const signUp = async (username: string, password: string, confirm: string, displayName: string) => {
    const normalized = username.trim().toLowerCase();
    if (!normalized || !password) return { error: 'Username and password are required.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
    if (password !== confirm) return { error: 'Passwords do not match.' };

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase!.rpc('register_player', {
          p_display_name: displayName?.trim() || username.trim(),
          p_password: password,
          p_username: username.trim(),
        });
        if (error) return { error: error.message || 'Registration failed.' };
        if (!data?.success) return { error: data?.error || 'Registration failed.' };
        const raw = data.player || {};
        const p: Player = {
          id: raw.id,
          username: raw.username,
          usernameNormalized: (raw.username || '').toLowerCase(),
          displayName: raw.display_name ?? raw.displayName ?? raw.username,
          role: 'USER',
          createdAt: raw.created_at || new Date().toISOString(),
          lastLoginAt: raw.last_login_at || new Date().toISOString(),
          lastPackBatchAt: raw.last_pack_batch_at ?? null,
          packsInCurrentBatch: Number(raw.packs_in_current_batch ?? 5),
          totalPacksOpened: Number(raw.total_packs_opened ?? 0),
          isActive: true,
        };
        localStorage.setItem('pcc_session', JSON.stringify({ token: data.session_token || '' }));
        setPlayer(p);
        return { error: null };
      } catch (e: any) {
        return { error: e?.message || 'Authentication service unavailable.' };
      }
    }

    if (localStorage.getItem(PLAYER_KEY(normalized))) return { error: 'Username already exists.' };
    const p = makePlayer(username, displayName);
    localStorage.setItem(PLAYER_KEY(normalized), JSON.stringify(p));
    localStorage.setItem(PLAYER_OBJECT_KEY(p.id), JSON.stringify(p));
    localStorage.setItem(PASSWORD_KEY(normalized), password);
    setPlayer(p);
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('pcc_session');
    localStorage.removeItem(SESSION_KEY);
    setPlayer(null);
    setCooldown(defaultCooldown());
    setWelcomeModalState('NONE');
    setOpen(false);
  };

  const updatePlayerState = (nextPlayer: Player, nextCooldown: CooldownState) => {
    setPlayer(nextPlayer);
    setCooldown(nextCooldown);
    localStorage.setItem(PLAYER_OBJECT_KEY(nextPlayer.id), JSON.stringify(nextPlayer));
    localStorage.setItem(PLAYER_KEY(nextPlayer.username), JSON.stringify(nextPlayer));
  };

  const dismissWelcomeModal = () => {
    if (!player) return;
    localStorage.setItem('pcc_welcome_seen_' + player.id, '1');
    setWelcomeModalState('NONE');
  };

  const value = useMemo<AuthValue>(
    () => ({
      player,
      isAdmin: player?.role === 'ADMIN',
      // The current app uses its local, player-scoped persistence path. This
      // keeps login/collection reliable even when no Supabase runtime config exists.
      isConfigured: isSupabaseConfigured(),
      cooldown,
      welcomeModalState,
      isAuthModalOpen,
      authModalMode,
      openAuthModal: (m = 'LOGIN') => {
        setMode(m);
        setOpen(true);
      },
      closeAuthModal: () => setOpen(false),
      dismissWelcomeModal,
      updatePlayerState,
      signIn,
      signUp,
      signOut,
    }),
    [player, cooldown, welcomeModalState, isAuthModalOpen, authModalMode]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

function readCollection(id: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem('pcc_collection_' + id);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useAuth() {
  const value = useContext(C);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
