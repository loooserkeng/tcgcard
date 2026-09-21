import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActressCard } from '../types';
import { CardBack } from './CardBack';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, FastForward, Crown, Film } from 'lucide-react';

interface PackOpeningProps {
  cards: ActressCard[];
  onComplete: () => void;
  reducedMotion?: boolean;
}

export const PackOpening: React.FC<PackOpeningProps> = ({
  cards,
  onComplete,
  reducedMotion = false,
}) => {
  // Sequence stages:
  // 'zoom_in' (0-700ms)
  // 'shake' (700-1400ms)
  // 'tear' (1400-2200ms)
  // 'burst' (2200-3000ms)
  // 'cards_emerge' (3000-4100ms)
  const [stage, setStage] = useState<'zoom_in' | 'shake' | 'tear' | 'burst' | 'cards_emerge'>('zoom_in');
  const timerRef = useRef<number[]>([]);

  const cleanupTimers = () => {
    timerRef.current.forEach((id) => clearTimeout(id));
    timerRef.current = [];
  };

  const handleSkip = () => {
    cleanupTimers();
    soundManager.playCardFlip();
    onComplete();
  };

  useEffect(() => {
    if (reducedMotion) {
      handleSkip();
      return;
    }

    // Step 1: Pack emerges & starts shaking
    timerRef.current.push(
      window.setTimeout(() => {
        setStage('shake');
        soundManager.playPackShake();
      }, 700)
    );

    // Step 2: Tear begins
    timerRef.current.push(
      window.setTimeout(() => {
        setStage('tear');
        soundManager.playPackTear();
      }, 1400)
    );

    // Step 3: Dramatic Burst with crimson & gold rays and confetti
    timerRef.current.push(
      window.setTimeout(() => {
        setStage('burst');
        soundManager.playPackOpening();

        try {
          confetti({
            particleCount: 85,
            spread: 95,
            origin: { y: 0.5 },
            colors: ['#ef4444', '#dc2626', '#fbbf24', '#ff2e5b', '#ffffff'],
          });
        } catch {}
      }, 2200)
    );

    // Step 4: Cards emerge and fan
    timerRef.current.push(
      window.setTimeout(() => {
        setStage('cards_emerge');
      }, 3000)
    );

    // Step 5: Transition to reveal screen
    timerRef.current.push(
      window.setTimeout(() => {
        onComplete();
      }, 4200)
    );

    return cleanupTimers;
  }, [reducedMotion]);

  return (
    <div
      id="pack-opening-modal"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070102]/95 backdrop-blur-xl select-none overflow-hidden"
    >
      {/* Skip Button */}
      <button
        id="skip-pack-opening-btn"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 text-xs font-mono font-bold tracking-wider text-red-200 hover:text-white transition-all cursor-pointer backdrop-blur-md"
      >
        <span>SKIP</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* Atmospheric Red Light Rays & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Rotating Light Rays */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[800px] h-[800px] opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle, transparent 20%, #ef4444 80%), repeating-conic-gradient(from 0deg, rgba(239,68,68,0.3) 0deg 15deg, transparent 15deg 30deg)',
          }}
        />

        {/* Pulsing Core Glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.4 }}
          animate={{
            scale: stage === 'burst' || stage === 'cards_emerge' ? 2.5 : stage === 'shake' ? 1.3 : 1,
            opacity: stage === 'burst' ? 1 : 0.6,
          }}
          transition={{ duration: 0.6 }}
          className="w-96 h-96 rounded-full bg-gradient-to-tr from-red-600/50 via-rose-600/40 to-amber-500/30 blur-3xl"
        />
      </div>

      {/* Flash overlay during burst */}
      <AnimatePresence>
        {stage === 'burst' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 bg-gradient-to-b from-white via-red-100 to-rose-200 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Center Stage Animation */}
      <div className="relative flex flex-col items-center justify-center">
        {stage !== 'cards_emerge' ? (
          /* THE PACK ANIMATION */
          <motion.div
            animate={
              stage === 'shake'
                ? {
                    x: [-6, 6, -7, 6, -4, 4, 0],
                    y: [-2, 3, -2, 3, -2, 1, 0],
                    scale: 1.15,
                    rotate: [-1.5, 1.5, -2, 2, 0],
                  }
                : stage === 'tear'
                ? {
                    scale: 1.22,
                    y: 8,
                  }
                : stage === 'burst'
                ? {
                    scale: 1.35,
                    opacity: [1, 0.3, 0],
                  }
                : {
                    scale: [0.95, 1.05],
                    y: [0, -8, 0],
                  }
            }
            transition={{
              duration: stage === 'shake' ? 0.7 : stage === 'tear' ? 0.8 : 1.2,
              ease: 'easeInOut',
              repeat: stage === 'zoom_in' ? Infinity : 0,
            }}
            className="relative w-64 h-[390px] sm:w-72 sm:h-[440px] rounded-2xl p-1 bg-gradient-to-b from-[#4d0a15] via-[#26040a] to-[#0d0103] border-2 border-red-500/70 shadow-2xl flex flex-col justify-between overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.95), 0 0 35px rgba(220,38,38,0.6)',
            }}
          >
            {/* Top foil cap (tears away during 'tear' stage) */}
            <motion.div
              animate={
                stage === 'tear' || stage === 'burst'
                  ? {
                      y: -90,
                      rotate: -12,
                      opacity: 0,
                    }
                  : { y: 0 }
              }
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative z-20 h-16 w-full rounded-t-xl bg-gradient-to-b from-red-950 via-rose-900 to-red-950 border-b-2 border-red-400 p-2 flex flex-col items-center justify-center overflow-hidden"
            >
              <div className="w-8 h-1.5 rounded-full bg-black/60 border border-red-400/30 mb-1" />
              <span className="text-[10px] font-mono tracking-widest text-red-200 font-bold">
                SEALED BOOSTER
              </span>

              {/* Glowing tear ray */}
              {stage === 'tear' && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-red-400 shadow-[0_0_15px_#ef4444] animate-pulse" />
              )}
            </motion.div>

            {/* Middle Pack Body */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-16 h-16 rounded-xl rotate-45 border border-red-500/60 bg-red-950/50 flex items-center justify-center mb-3">
                <Crown className="w-8 h-8 text-amber-400 -rotate-45" />
              </div>
              <h2 className="text-2xl font-black tracking-widest text-white uppercase font-serif">
                ACTRESS
              </h2>
              <span className="text-xs font-bold tracking-[0.3em] text-red-300 uppercase">
                CARD COLLECTION
              </span>
              <div className="mt-4 px-3 py-1 rounded-full bg-black/60 border border-red-500/40 text-xs font-mono text-red-300 font-bold">
                3 CARDS INSIDE
              </div>
            </div>

            {/* Bottom foil cap */}
            <div className="relative z-10 h-6 w-full rounded-b-xl bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-t border-red-500/20" />
          </motion.div>
        ) : (
          /* 3 CARDS FLYING OUT AND STACKING */
          <div className="relative w-64 h-[380px] sm:w-72 sm:h-[430px] flex items-center justify-center">
            {cards.map((card, idx) => (
              <motion.div
                key={card.id + idx}
                initial={{
                  scale: 0.4,
                  y: 120,
                  opacity: 0,
                  rotate: (idx - 2) * 15,
                }}
                animate={{
                  scale: 1,
                  y: idx * -4,
                  opacity: 1,
                  rotate: (idx - 2) * 2,
                }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: 'backOut',
                }}
                className="absolute inset-0"
              >
                <CardBack />
              </motion.div>
            ))}
          </div>
        )}

        {/* Status text subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <div className="text-lg font-serif font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-white to-amber-200 uppercase">
            {stage === 'zoom_in' && 'PREPARING ACTRESS BOOSTER...'}
            {stage === 'shake' && 'CHARGING CINEMATIC ENERGY...'}
            {stage === 'tear' && 'UNSEALING BOOSTER FOIL...'}
            {stage === 'burst' && 'UNLEASHING COLLECTIBLES!'}
            {stage === 'cards_emerge' && '3 ACTRESS CARDS REVEALED!'}
          </div>
          <p className="text-xs font-mono text-red-300/80 mt-1">
            Tap to inspect each actress card
          </p>
        </motion.div>
      </div>
    </div>
  );
};
