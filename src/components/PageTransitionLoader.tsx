import React, { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TypewriterText } from './AnimatedTypography';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface PageTransitionLoaderProps {
  visible: boolean;
  label?: string;
}

const LoaderRings: React.FC<{ shouldReduceMotion: boolean }> = ({
  shouldReduceMotion,
}) => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const outerRingRef = useRef<HTMLDivElement | null>(null);
  const innerRingRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion) return;
    const scope = ringRef.current;
    const outer = outerRingRef.current;
    const inner = innerRingRef.current;
    if (!scope || !scope.isConnected) return;

    const ctx = gsap.context(() => {
      if (outer && outer.isConnected) {
        gsap.to(outer, {
          rotation: 360,
          duration: 4.5,
          repeat: -1,
          ease: 'none',
        });
      }
      if (inner && inner.isConnected) {
        gsap.to(inner, {
          rotation: -360,
          duration: 3.1,
          repeat: -1,
          ease: 'none',
        });
      }
    }, scope);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <div ref={ringRef} className="relative w-20 h-20 flex items-center justify-center mb-5">
      <div
        ref={outerRingRef}
        data-loader-ring="outer"
        className="absolute inset-0 rounded-full border border-[#D6A84F]/35 border-t-[#F3D999]"
      />
      <div
        ref={innerRingRef}
        data-loader-ring="inner"
        className="absolute inset-2.5 rounded-full border border-[#D6A84F]/25 border-b-[#D6A84F]"
      />
      <span className="font-brand text-lg font-extrabold text-[#F3D999] tracking-widest">
        YN
      </span>
    </div>
  );
};

export const PageTransitionLoader: React.FC<PageTransitionLoaderProps> = ({
  visible,
  label = 'Preparing Your Need Concierge',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="luxury-page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[60] bg-[#08080A]/94 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <LoaderRings shouldReduceMotion={Boolean(shouldReduceMotion)} />

          <p className="font-brand text-base font-bold tracking-[0.2em] text-[#FFF8EA] uppercase">
            YOUR NEED
          </p>
          <TypewriterText
            text={label}
            as="p"
            speedMs={18}
            delayMs={20}
            className="text-xs text-[#D6A84F] mt-2 font-medium"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
