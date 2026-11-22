import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BrandLogoMarkProps {
  size?: LogoSize;
  animated?: boolean;
  interactive?: boolean;
  boostSignal?: number;
  className?: string;
}

const SIZE_CLASSES: Record<LogoSize, string> = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  size = 'md',
  animated = true,
  interactive = false,
  boostSignal = 0,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const enableMotion = animated && !shouldReduceMotion;
  const uid = React.useId().replace(/:/g, '');
  const tricolorGradId = `yn-tri-${uid}`;
  const saffronGradId = `yn-saf-${uid}`;
  const crestBgId = `yn-bg-${uid}`;

  return (
    <motion.div
      initial={
        enableMotion
          ? { opacity: 0, scale: 0.72, rotate: -14 }
          : false
      }
      animate={
        enableMotion
          ? {
              opacity: 1,
              scale: 1,
              rotate: boostSignal * 360,
            }
          : { opacity: 1, scale: 1, rotate: 0 }
      }
      whileHover={interactive && !shouldReduceMotion ? { scale: 1.07, rotate: boostSignal * 360 + 6 } : undefined}
      whileTap={interactive && !shouldReduceMotion ? { scale: 0.94 } : undefined}
      transition={{
        duration: boostSignal > 0 ? 0.72 : 0.65,
        ease: EASE_LUXURY,
      }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${SIZE_CLASSES[size]} ${className}`}
    >
      {/* Subtle Dual Saffron + Emerald Ambient Glow */}
      {enableMotion ? (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [0.35, 0.72, 0.35], scale: [0.95, 1.1, 0.95] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E87516]/30 via-[#FFFDF8]/15 to-[#138808]/35 blur-md pointer-events-none"
        />
      ) : null}

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_6px_16px_rgba(7,94,54,0.4)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={tricolorGradId} x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="32%" stopColor="#FFD28A" />
            <stop offset="52%" stopColor="#FFFDF8" />
            <stop offset="76%" stopColor="#35C46A" />
            <stop offset="100%" stopColor="#075E36" />
          </linearGradient>
          <linearGradient id={saffronGradId} x1="20" y1="18" x2="100" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="32%" stopColor="#FFD28A" />
            <stop offset="68%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#E87516" />
          </linearGradient>
          <radialGradient id={crestBgId} cx="48%" cy="35%" r="68%">
            <stop offset="0%" stopColor="#101A17" />
            <stop offset="62%" stopColor="#071B16" />
            <stop offset="100%" stopColor="#07130F" />
          </radialGradient>
        </defs>

        {/* Deep Darkened Emerald-Obsidian Medallion Core */}
        <circle cx="60" cy="60" r="54" fill={`url(#${crestBgId})`} />

        {/* Outer Animated Indian Tricolour Orbital Ring */}
        <motion.circle
          cx="60"
          cy="60"
          r="53"
          stroke={`url(#${tricolorGradId})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={enableMotion ? { pathLength: 0, opacity: 0.35 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_LUXURY }}
        />

        {/* Rotating Precision Dashed Orbit */}
        <motion.circle
          cx="60"
          cy="60"
          r="46"
          stroke="#35C46A"
          strokeOpacity="0.48"
          strokeWidth="1.4"
          strokeDasharray="8 6"
          animate={enableMotion ? { rotate: 360 } : undefined}
          transition={
            enableMotion
              ? { duration: 18, repeat: Infinity, ease: 'linear' }
              : undefined
          }
          style={{ transformOrigin: '60px 60px' }}
        />

        {/* Architectural Hexagonal Shield Frame */}
        <motion.path
          d="M60 19L97 40V80L60 101L23 80V40L60 19Z"
          stroke={`url(#${tricolorGradId})`}
          strokeOpacity="0.58"
          strokeWidth="1.6"
          strokeLinejoin="round"
          initial={enableMotion ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: EASE_LUXURY }}
        />

        {/* Precision Wrench Emblem in Saffron-Gold */}
        <motion.path
          d="M73.5 39.5a15.5 15.5 0 0 0-20.4-1.3l9.7 9.7-9.2 9.2-9.7-9.7a15.5 15.5 0 0 0 1.3 20.4 15.5 15.5 0 0 0 18.3 2.5l17.6 17.6a5.4 5.4 0 0 0 7.6-7.6L71.1 62.7a15.5 15.5 0 0 0 2.4-23.2Z"
          fill={`url(#${saffronGradId})`}
          initial={enableMotion ? { opacity: 0, scale: 0.78 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: EASE_LUXURY }}
          style={{ transformOrigin: '60px 60px' }}
        />

        {/* Top-left Ivory-Emerald Spark Accent */}
        <motion.path
          d="M37 31L40 37L46 40L40 43L37 49L34 43L28 40L34 37L37 31Z"
          fill="#FFFDF8"
          animate={
            enableMotion
              ? { scale: [0.9, 1.2, 0.9], opacity: [0.78, 1, 0.78] }
              : undefined
          }
          transition={
            enableMotion
              ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
          style={{ transformOrigin: '37px 40px' }}
        />
        {/* Bottom-right Subtle Emerald Jewel Dot */}
        <circle cx="83" cy="83" r="3" fill="#35C46A" />
      </svg>

      {/* Tricolour Sheen Sweep */}
      {enableMotion ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full overflow-hidden z-20"
        >
          <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFFDF8]/30 to-transparent animate-gold-sheen" />
        </span>
      ) : null}
    </motion.div>
  );
};

interface StartupLogoSplashProps {
  visible: boolean;
  onSkip: () => void;
  theme: 'light' | 'dark';
}

export const StartupLogoSplash: React.FC<StartupLogoSplashProps> = ({
  visible,
  onSkip,
  theme,
}) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, onSkip]);

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="startup-logo-splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: EASE_LUXURY }}
          onClick={onSkip}
          className={`fixed inset-0 z-[70] flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer overflow-hidden ${
            isDark ? 'bg-[#07130F] text-[#FFFDF8]' : 'bg-[#071B16] text-[#FFFDF8]'
          }`}
          role="status"
          aria-live="polite"
          aria-label="Launching Your Need"
        >
          {/* Ambient Tricolour Corner Glows */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#E87516]/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-[#075E36]/30 blur-3xl pointer-events-none"
          />

          {/* Expanding Tricolour Aura Rings */}
          {!shouldReduceMotion ? (
            <>
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.5, 1.38, 1.65], opacity: [0, 0.42, 0] }}
                transition={{ duration: 1.8, ease: EASE_LUXURY, repeat: Infinity, repeatDelay: 0.35 }}
                className="absolute w-72 h-72 rounded-full border border-[#FF9933]/40 pointer-events-none"
              />
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0.45, opacity: 0 }}
                animate={{ scale: [0.55, 1.25, 1.5], opacity: [0, 0.35, 0] }}
                transition={{ duration: 1.8, delay: 0.45, ease: EASE_LUXURY, repeat: Infinity, repeatDelay: 0.35 }}
                className="absolute w-72 h-72 rounded-full border border-[#35C46A]/35 pointer-events-none"
              />
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.15, opacity: 0.32 }}
                transition={{ duration: 1.1, ease: EASE_LUXURY }}
                className="absolute w-80 h-80 rounded-full bg-radial from-[#FF9933]/20 via-[#075E36]/12 to-transparent blur-2xl pointer-events-none"
              />
            </>
          ) : null}

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={shouldReduceMotion ? false : { y: 18, scale: 0.7, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <BrandLogoMark size="xl" animated={true} />
            </motion.div>

            {/* Staggered Tricolour Brand Title */}
            <div className="mt-6 flex items-center justify-center gap-2.5 leading-none" style={{ perspective: 800 }}>
              <div className="flex items-center">
                {'YOUR'.split('').map((ch, idx) => (
                  <motion.span
                    key={`splash-your-${idx}`}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16, rotateX: -48 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 290,
                      damping: 22,
                      delay: shouldReduceMotion ? 0 : 0.2 + idx * 0.045,
                    }}
                    className="inline-block font-brand text-3xl sm:text-4xl font-extrabold tracking-wider text-[#FFFDF8] drop-shadow-[0_2px_10px_rgba(255,153,51,0.22)]"
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>
              <div className="flex items-center">
                {'NEED'.split('').map((ch, idx) => (
                  <motion.span
                    key={`splash-need-${idx}`}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16, rotateX: -48 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 290,
                      damping: 22,
                      delay: shouldReduceMotion ? 0 : 0.38 + idx * 0.045,
                    }}
                    className="inline-block font-brand text-3xl sm:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-[#FF9933] via-[#FFFDF8] to-[#35C46A] bg-clip-text text-transparent animate-brand-gradient"
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.62, duration: 0.4 }}
              className="mt-2.5 text-xs font-semibold uppercase tracking-[0.26em] text-[#FFB866]"
            >
              Find Everything You Need, In One Place
            </motion.p>

            {/* Boot Tricolour Progress Line */}
            <div className="mt-6 w-48 h-1.5 rounded-full bg-[#101A17] border border-white/10 overflow-hidden">
              <motion.div
                initial={shouldReduceMotion ? { width: '100%' } : { width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 1.45, ease: EASE_LUXURY }}
                className="h-full rounded-full bg-gradient-to-r from-[#E87516] via-[#FFFDF8] to-[#138808]"
              />
            </div>

            <span className="mt-4 text-[11px] text-[#E8EDF2]/70">
              Tap anywhere to continue
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
