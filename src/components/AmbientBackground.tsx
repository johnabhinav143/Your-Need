import React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import goldDesertBackdrop from '../assets/images/gold_desert_ambient_backdrop_1795253091746.jpg';

export const AmbientBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const desertParallaxY = useTransform(scrollY, [0, 1400], [0, -64]);
  const dotParallaxY = useTransform(scrollY, [0, 1400], [0, -32]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#F6F0E2] dark:bg-[#08080A] transition-colors duration-500"
    >
      {/* Panoramic Gold Desert Horizon Backdrop with Scroll Parallax & Ken Burns */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: desertParallaxY }}
        className="absolute -inset-y-12 inset-x-0 will-change-transform"
      >
        <motion.img
          src={goldDesertBackdrop}
          alt=""
          referrerPolicy="no-referrer"
          initial={{ scale: 1.04, opacity: 0.3 }}
          animate={
            shouldReduceMotion
              ? { scale: 1.04, opacity: 0.32 }
              : {
                  scale: [1.04, 1.09, 1.04],
                  opacity: [0.28, 0.4, 0.28],
                }
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-full h-full object-cover object-center opacity-25 dark:opacity-45 mix-blend-multiply dark:mix-blend-normal"
        />
      </motion.div>

      {/* Obsidian & Warm Sand Scrim for 4.5:1+ Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F6F0E2]/88 via-[#F6F0E2]/82 to-[#F6F0E2]/95 dark:from-[#08080A]/82 dark:via-[#08080A]/76 dark:to-[#08080A]/94 transition-colors duration-500" />

      {/* Subtle Gold Desert Matrix Dots with Parallax */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: dotParallaxY }}
        initial={{ opacity: 0.35 }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.35 }
            : { opacity: [0.28, 0.48, 0.28] }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-12 bg-[radial-gradient(rgba(158,118,40,0.14)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(214,168,79,0.18)_1px,transparent_1px)] [background-size:30px_30px] will-change-transform"
      />

      {/* 1. Burnished 24K Gold Desert Horizon Glow (top-left) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 65, -24, 0],
                y: [0, 44, -18, 0],
                scale: [1, 1.12, 0.96, 1],
                opacity: [0.42, 0.65, 0.38, 0.42],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-36 -left-32 w-[38rem] h-[38rem] rounded-full bg-[#D6A84F]/24 dark:bg-[#D6A84F]/16 blur-3xl will-change-transform"
      />

      {/* 2. Champagne Gold Rim Haze (top-right) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -58, 28, 0],
                y: [0, 40, -22, 0],
                scale: [1, 1.09, 0.95, 1],
                opacity: [0.32, 0.52, 0.28, 0.32],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-28 -right-32 w-[34rem] h-[34rem] rounded-full bg-[#F3D999]/22 dark:bg-[#D6A84F]/12 blur-3xl will-change-transform"
      />

      {/* 3. Antique Bronze-Gold Desert Dusk Glow (bottom-left) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 52, -30, 0],
                y: [0, -38, 20, 0],
                scale: [1, 1.1, 0.95, 1],
                opacity: [0.35, 0.56, 0.32, 0.35],
              }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-36 -left-24 w-[36rem] h-[36rem] rounded-full bg-[#9E7628]/20 dark:bg-[#B6832C]/14 blur-3xl will-change-transform"
      />
    </div>
  );
};
