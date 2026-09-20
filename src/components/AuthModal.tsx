import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../utils/audio';
import {
  X,
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  KeyRound,
  Crown,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSetup?: () => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenSetup }) => {
  const { signIn, signUp, authModalMode } = useAuth();

  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(authModalMode || 'LOGIN');
      setErrorMsg('');
      setShowForgotNotice(false);
    }
  }, [isOpen, authModalMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShowForgotNotice(false);
    setSubmitting(true);
    soundManager.playButtonClick();

    try {
      if (mode === 'LOGIN') {
        const { error } = await signIn(username, password);
        if (error) {
          setErrorMsg(error);
          soundManager.playCardFlip();
        } else {
          soundManager.playCollectionAdded();
          onClose();
        }
      } else {
        const { error } = await signUp(username, password, confirmPassword, displayName);
        if (error) {
          setErrorMsg(error);
          soundManager.playCardFlip();
        } else {
          soundManager.playCollectionAdded();
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-[#140205] border border-red-500/40 p-6 sm:p-8 shadow-2xl shadow-red-950/60 flex flex-col my-auto"
      >
        {/* Close button */}
        <button
          id="close-auth-modal-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/30 flex items-center justify-center text-red-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-red-600/25 blur-3xl pointer-events-none" />

        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/30 via-rose-600/20 to-amber-500/20 border border-red-500/40 flex items-center justify-center mb-3 shadow-lg shadow-red-600/20">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-red-200 uppercase">
            ACTRESS CARD COLLECTION
          </h2>

          <p className="text-xs sm:text-sm font-mono text-red-300/80 mt-1">
            {mode === 'SIGNUP'
              ? 'Create your collector account'
              : 'Sign in to access your actress cards vault'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="leading-relaxed font-sans block">{errorMsg}</span>
              {onOpenSetup && (errorMsg.includes('console') || errorMsg.includes('unavailable') || errorMsg.includes('service error')) && (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onOpenSetup();
                  }}
                  className="mt-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 underline block cursor-pointer"
                >
                  View Database Setup Instructions
                </button>
              )}
            </div>
          </div>
        )}

        {/* Forgot Password Notice */}
        {showForgotNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">
              <span className="font-semibold block mb-0.5">Password Recovery:</span>
              Password recovery is managed by the administrator. Contact your admin for a reset.
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {/* USERNAME */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-red-200 mb-1.5 font-bold">
              USERNAME
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-red-400 pointer-events-none" />
              <input
                id="auth-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'SIGNUP' ? 'e.g. cinema_buff' : 'Enter username'}
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-sm text-white placeholder:text-red-300/40 focus:outline-hidden focus:border-red-400 font-sans transition-all"
              />
            </div>
          </div>

          {/* DISPLAY NAME (Optional on signup) */}
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-red-200 mb-1.5 font-bold">
                DISPLAY NAME <span className="text-red-300/50 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="absolute left-3.5 w-4 h-4 text-red-400 pointer-events-none" />
                <input
                  id="auth-display-name-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Collector Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-sm text-white placeholder:text-red-300/40 focus:outline-hidden focus:border-red-400 font-sans transition-all"
                />
              </div>
            </div>
          )}

          {/* PASSWORD */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-red-200 font-bold">
                PASSWORD
              </label>
              {mode === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() => setShowForgotNotice((prev) => !prev)}
                  className="text-[11px] font-mono text-red-300 hover:text-white cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-red-400 pointer-events-none" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'SIGNUP' ? 'new-password' : 'current-password'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-sm text-white placeholder:text-red-300/40 focus:outline-hidden focus:border-red-400 font-sans transition-all"
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD (Signup only) */}
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-red-200 mb-1.5 font-bold">
                CONFIRM PASSWORD
              </label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 w-4 h-4 text-red-400 pointer-events-none" />
                <input
                  id="auth-confirm-password-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-sm text-white placeholder:text-red-300/40 focus:outline-hidden focus:border-red-400 font-sans transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold font-serif tracking-[0.15em] text-xs uppercase shadow-lg shadow-red-600/40 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 border border-red-400/40"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'SIGNUP' ? (
              <>
                <span>CREATE ACCOUNT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 pt-5 border-t border-red-500/20 flex items-center justify-center text-xs font-mono text-red-200/80 relative z-10">
          {mode === 'LOGIN' ? (
            <div className="flex items-center gap-2">
              <span>New collector?</span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setMode('SIGNUP');
                  setErrorMsg('');
                  setShowForgotNotice(false);
                }}
                className="font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                CREATE ACCOUNT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setMode('LOGIN');
                  setErrorMsg('');
                  setShowForgotNotice(false);
                }}
                className="font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                LOGIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
