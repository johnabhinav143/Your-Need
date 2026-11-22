import React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import goldDesertBackdrop from '../assets/images/gold_desert_ambient_backdrop_1795253091746.jpg';

const FLOATING_PARTICLES = [
  { left: '8%', top: '22%', size: 4, color: '#FFD28A', delay: '0s', duration: '11s' },
  { left: '16%', top: '68%', size: 3, color: '#FF9933', delay: '1.8s', duration: '13s' },
  { left: '25%', top: '40%', size: 5, color: '#7DFF9B', delay: '3.2s', duration: '12s' },
  { left: '34%', top: '78%', size: 3, color: '#FFD28A', delay: '0.9s', duration: '14s' },
  { left: '46%', top: '28%', size: 4, color: '#FFB866', delay: '2.5s', duration: '10.5s' },
  { left: '54%', top: '62%', size: 3, color: '#35C46A', delay: '4.1s', duration: '12.5s' },
  { left: '65%', top: '34%', size: 4, color: '#FFD28A', delay: '1.2s', duration: '11.5s' },
  { left: '74%', top: '74%', size: 3, color: '#FF9933', delay: '3.6s', duration: '13.5s' },
  { left: '84%', top: '25%', size: 5, color: '#7DFF9B', delay: '0.5s', duration: '12s' },
  { left: '91%', top: '58%', size: 3, color: '#FFD28A', delay: '2.9s', duration: '11s' },
  { left: '12%', top: '86%', size: 4, color: '#35C46A', delay: '4.6s', duration: '13s' },
  { left: '61%', top: '84%', size: 3, color: '#FFB866', delay: '2.1s', duration: '10s' },
] as const;

const LIGHT_STREAKS = [
  { left: '14%', height: 78, color: 'rgba(255, 210, 138, 0.35)', delay: '0s', duration: '9.5s' },
  { left: '36%', height: 96, color: 'rgba(255, 153, 51, 0.28)', delay: '3.1s', duration: '11s' },
  { left: '58%', height: 72, color: 'rgba(125, 255, 155, 0.22)', delay: '1.7s', duration: '10s' },
  { left: '78%', height: 88, color: 'rgba(255, 210, 138, 0.32)', delay: '4.8s', duration: '12s' },
  { left: '92%', height: 64, color: 'rgba(53, 196, 106, 0.25)', delay: '2.4s', duration: '9s' },
] as const;

export const AmbientBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const desertParallaxY = useTransform(scrollY, [0, 1400], [0, -64]);
  const dotParallaxY = useTransform(scrollY, [0, 1400], [0, -32]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#F8FAFC] dark:bg-[#07130F] transition-colors duration-500"
    >
      {/* Subtle Architectural Texture Backdrop with Parallax */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: desertParallaxY }}
        className="absolute -inset-y-12 inset-x-0 will-change-transform"
      >
        <motion.img
          src={goldDesertBackdrop}
          alt=""
          referrerPolicy="no-referrer"
          initial={{ scale: 1.04, opacity: 0.2 }}
          animate={
            shouldReduceMotion
              ? { scale: 1.04, opacity: 0.22 }
              : {
                  scale: [1.04, 1.08, 1.04],
                  opacity: [0.16, 0.26, 0.16],
                }
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-full h-full object-cover object-center opacity-15 dark:opacity-25 mix-blend-multiply dark:mix-blend-luminosity"
        />
      </motion.div>

      {/* Darkened Indian Tricolour Atmospheric Scrim (Deep Emerald-Obsidian Night / Ivory Mist Day) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/92 via-[#FFFDF8]/88 to-[#E8EDF2]/94 dark:from-[#07130F]/92 dark:via-[#071B16]/84 dark:to-[#07130F]/96 transition-colors duration-500" />

      {/* Precision Matrix Grid */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: dotParallaxY }}
        initial={{ opacity: 0.3 }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.3 }
            : { opacity: [0.24, 0.42, 0.24] }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-12 bg-[radial-gradient(rgba(7,94,54,0.1)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,153,51,0.14)_1px,transparent_1px)] [background-size:32px_32px] will-change-transform"
      />

      {/* 1. Darkened Saffron Ambient Horizon Aura (Top-Left) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 56, -22, 0],
                y: [0, 38, -16, 0],
                scale: [1, 1.1, 0.96, 1],
                opacity: [0.32, 0.5, 0.28, 0.32],
              }
        }
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -left-36 w-[38rem] h-[38rem] rounded-full bg-[#FF9933]/14 dark:bg-[#E87516]/16 blur-3xl will-change-transform"
      />

      {/* 2. Ivory / Golden Highlight Crest Glow (Top-Right) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -48, 24, 0],
                y: [0, 34, -18, 0],
                scale: [1, 1.08, 0.96, 1],
                opacity: [0.24, 0.4, 0.22, 0.24],
              }
        }
        transition={{
          duration: 23,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-[#FFD28A]/18 dark:bg-[#FFB866]/10 blur-3xl will-change-transform"
      />

      {/* 3. Deep Indian Emerald Ambient Glow (Bottom-Right & Bottom-Left) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 46, -26, 0],
                y: [0, -34, 18, 0],
                scale: [1, 1.1, 0.95, 1],
                opacity: [0.34, 0.52, 0.3, 0.34],
              }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-40 -right-24 w-[38rem] h-[38rem] rounded-full bg-[#138808]/12 dark:bg-[#075E36]/26 blur-3xl will-change-transform"
      />
      <div className="absolute -bottom-44 -left-28 w-[32rem] h-[32rem] rounded-full bg-[#075E36]/8 dark:bg-[#075E36]/18 blur-3xl" />

      {/* 4. Subtle Cinematic Golden / Saffron / Emerald Particles & Falling Light Streaks */}
      {!shouldReduceMotion ? (
        <div className="absolute inset-0 overflow-hidden opacity-60 dark:opacity-85">
          {FLOATING_PARTICLES.map((p, idx) => (
            <span
              key={`particle-${idx}`}
              className="absolute rounded-full animate-particle-drift"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}

          {LIGHT_STREAKS.map((s, idx) => (
            <span
              key={`streak-${idx}`}
              className="absolute top-0 w-px animate-streak-fall"
              style={{
                left: s.left,
                height: `${s.height}px`,
                background: `linear-gradient(180deg, transparent 0%, ${s.color} 55%, transparent 100%)`,
                animationDelay: s.delay,
                animationDuration: s.duration,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
