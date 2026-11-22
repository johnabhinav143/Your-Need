import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

type TextTag = 'h1' | 'h2' | 'h3' | 'p' | 'span';
type RevealMode = 'word' | 'line' | 'slide-up' | '3d-flip';

interface BlurRevealTextProps {
  text: string;
  as?: TextTag;
  className?: string;
  mode?: RevealMode;
  delay?: number;
  stagger?: number;
  scrollTrigger?: boolean;
  scrollReactive?: boolean;
  accentLastWords?: number;
  blurAmount?: number;
}

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const BlurRevealText: React.FC<BlurRevealTextProps> = ({
  text,
  as = 'p',
  className = '',
  mode = 'word',
  delay = 0,
  stagger = 0.032,
  scrollTrigger = true,
  scrollReactive = false,
  accentLastWords = 0,
  blurAmount = 9,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const visible = !scrollTrigger || isInView;
  const Tag = as;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 95%', 'end 10%'],
  });
  const scrollYShift = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [10, 0, 0, -8]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0.75, 1, 1, 0.72]);

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  if (mode === 'line' || mode === 'slide-up') {
    const yStart = mode === 'slide-up' ? 20 : 12;
    return (
      <motion.div
        ref={ref}
        style={scrollReactive ? { y: scrollYShift, opacity: scrollOpacity } : undefined}
        className="overflow-hidden"
      >
        <Tag className={className}>
          <motion.span
            key={text}
            initial={{ opacity: 0, y: yStart, filter: `blur(${blurAmount}px)` }}
            animate={
              visible
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: yStart, filter: `blur(${blurAmount}px)` }
            }
            transition={{ duration: 0.44, delay, ease: EASE_LUXURY }}
            className="inline-block"
          >
            {text}
          </motion.span>
        </Tag>
      </motion.div>
    );
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const effectiveStagger = Math.min(stagger, words.length > 10 ? 0.024 : stagger);
  const accentStartIdx =
    accentLastWords > 0 && words.length > accentLastWords
      ? words.length - accentLastWords
      : words.length;

  const is3D = mode === '3d-flip';

  return (
    <motion.div
      ref={ref}
      style={{
        ...(is3D ? { perspective: 900 } : {}),
        ...(scrollReactive ? { y: scrollYShift, opacity: scrollOpacity } : {}),
      }}
    >
      <Tag className={className} aria-label={text}>
        {words.map((word, idx) => {
          const isGoldAccent = idx >= accentStartIdx;
          return (
            <motion.span
              key={`${text}-${idx}-${word}`}
              aria-hidden="true"
              initial={
                is3D
                  ? { opacity: 0, y: 18, rotateX: -52, filter: `blur(${Math.max(4, blurAmount - 3)}px)` }
                  : { opacity: 0, y: 14, filter: `blur(${blurAmount}px)` }
              }
              animate={
                visible
                  ? { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }
                  : is3D
                    ? { opacity: 0, y: 18, rotateX: -52, filter: `blur(${Math.max(4, blurAmount - 3)}px)` }
                    : { opacity: 0, y: 14, filter: `blur(${blurAmount}px)` }
              }
              transition={{
                duration: is3D ? 0.48 : 0.38,
                delay: delay + idx * effectiveStagger,
                ease: EASE_LUXURY,
              }}
              className={`inline-block mr-[0.26em] last:mr-0 will-change-transform origin-bottom ${
                isGoldAccent
                  ? 'bg-gradient-to-r from-[#E87516] via-[#FF9933] to-[#138808] dark:from-[#FFB866] dark:via-[#FFFDF8] dark:to-[#35C46A] bg-clip-text text-transparent animate-brand-gradient'
                  : ''
              }`}
            >
              {word}
            </motion.span>
          );
        })}
      </Tag>
    </motion.div>
  );
};

interface TypewriterTextProps {
  text: string;
  as?: TextTag;
  className?: string;
  speedMs?: number;
  delayMs?: number;
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  as = 'p',
  className = '',
  speedMs = 24,
  delayMs = 80,
  showCursor = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [charCount, setCharCount] = useState(() => (shouldReduceMotion ? text.length : 0));
  const [done, setDone] = useState(Boolean(shouldReduceMotion));
  const Tag = as;

  useEffect(() => {
    if (shouldReduceMotion) {
      setCharCount(text.length);
      setDone(true);
      return;
    }
    if (!isInView) return;

    setCharCount(0);
    setDone(false);

    let rafId = 0;
    let startTs = 0;

    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs - delayMs;
      if (elapsed > 0) {
        const nextCount = Math.min(text.length, Math.floor(elapsed / speedMs) + 1);
        setCharCount(nextCount);
        if (nextCount >= text.length) {
          setDone(true);
          return;
        }
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [text, speedMs, delayMs, isInView, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <div ref={ref}>
      <Tag className={className} aria-label={text}>
        <span>{text.slice(0, charCount)}</span>
        {showCursor && !done ? (
          <span
            aria-hidden="true"
            className="inline-block w-[2px] h-[0.95em] align-middle ml-0.5 bg-[#FF9933] animate-pulse"
          />
        ) : null}
      </Tag>
    </div>
  );
};

interface GlitchTitleProps {
  text: string;
  as?: TextTag;
  className?: string;
}

export const GlitchTitle: React.FC<GlitchTitleProps> = ({
  text,
  as = 'span',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as;

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-[#FF9933] opacity-0 group-hover:opacity-75 animate-glitch-gold select-none"
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-[#138808] dark:text-[#35C46A] opacity-0 group-hover:opacity-55 translate-x-[1px] animate-glitch-gold select-none"
      >
        {text}
      </span>
    </Tag>
  );
};

interface GsapStaggerHeadlineProps {
  text: string;
  as?: TextTag;
  className?: string;
  accentLastWords?: number;
}

export const GsapStaggerHeadline: React.FC<GsapStaggerHeadlineProps> = ({
  text,
  as = 'h2',
  className = '',
  accentLastWords = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const Tag = as;

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !el.isConnected || shouldReduceMotion) return;

    const wordEls = Array.from(
      el.querySelectorAll<HTMLElement>('[data-gsap-word]')
    ).filter((node) => node.isConnected);
    if (wordEls.length === 0) return;

    let played = false;
    let disposed = false;

    const ctx = gsap.context(() => {
      gsap.set(wordEls, { opacity: 0, y: 16, rotateX: -35 });
    }, el);

    const playReveal = () => {
      if (disposed || played || !el.isConnected) return;
      const activeWords = Array.from(
        el.querySelectorAll<HTMLElement>('[data-gsap-word]')
      ).filter((node) => node.isConnected);
      if (activeWords.length === 0) return;

      played = true;
      ctx.add(() => {
        gsap.to(activeWords, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.48,
          stagger: 0.04,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      });
    };

    if (typeof IntersectionObserver === 'undefined') {
      playReveal();
      return () => {
        disposed = true;
        ctx.revert();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played && !disposed) {
            playReveal();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => {
      disposed = true;
      observer.disconnect();
      ctx.revert();
    };
  }, [text, shouldReduceMotion]);

  const words = text.trim().split(/\s+/).filter(Boolean);
  const accentStartIdx =
    accentLastWords > 0 && words.length > accentLastWords
      ? words.length - accentLastWords
      : words.length;

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <div ref={containerRef} style={{ perspective: 800 }}>
      <Tag className={className} aria-label={text}>
        {words.map((word, idx) => {
          const isAccent = idx >= accentStartIdx;
          return (
            <span
              key={`${text}-gsap-${idx}`}
              data-gsap-word
              aria-hidden="true"
              className={`inline-block mr-[0.26em] last:mr-0 will-change-transform ${
                isAccent
                  ? 'bg-gradient-to-r from-[#E87516] via-[#FF9933] to-[#138808] dark:from-[#FFB866] dark:via-[#FFFDF8] dark:to-[#35C46A] bg-clip-text text-transparent animate-brand-gradient'
                  : ''
              }`}
            >
              {word}
            </span>
          );
        })}
      </Tag>
    </div>
  );
};

interface MaskedWordMorphProps {
  phrases: string[];
  intervalMs?: number;
  className?: string;
}

export const MaskedWordMorph: React.FC<MaskedWordMorphProps> = ({
  phrases,
  intervalMs = 3000,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || phrases.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [phrases.length, intervalMs, shouldReduceMotion]);

  const current = phrases[index % Math.max(1, phrases.length)] || '';

  if (shouldReduceMotion) {
    return <span className={className}>{current}</span>;
  }

  return (
    <span className="inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 11, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -11, filter: 'blur(6px)' }}
          transition={{ duration: 0.3, ease: EASE_LUXURY }}
          className={`inline-block ${className}`}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

interface KineticMetricNumberProps {
  value: number;
  className?: string;
}

export const KineticMetricNumber: React.FC<KineticMetricNumberProps> = ({
  value,
  className = '',
}) => {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (shouldReduceMotion || !isInView) {
      setDisplayValue(value);
      return;
    }

    const startVal = prevValueRef.current;
    const endVal = value;
    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    const duration = 520;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(startVal + (endVal - startVal) * eased);
      setDisplayValue(next);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        prevValueRef.current = endVal;
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [value, isInView, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <p className={className}>{value}</p>;
  }

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 8, filter: 'blur(5px)' }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 8, filter: 'blur(5px)' }
      }
      transition={{ duration: 0.36, ease: EASE_LUXURY }}
      className={className}
    >
      {displayValue}
    </motion.p>
  );
};

interface LetterSweepBrandProps {
  text: string;
  className?: string;
}

export const LetterSweepBrand: React.FC<LetterSweepBrandProps> = ({
  text,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  const chars = text.split('');
  return (
    <span className={`inline-flex items-center ${className}`} aria-label={text}>
      {chars.map((char, idx) => (
        <motion.span
          key={`${text}-${idx}`}
          aria-hidden="true"
          initial={{ opacity: 0, y: 8, rotateY: -32, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, rotateY: 0, filter: 'blur(0px)' }}
          whileHover={{ y: -2 }}
          transition={{
            duration: 0.38,
            delay: idx * 0.025,
            ease: EASE_LUXURY,
          }}
          className="inline-block bg-gradient-to-r from-[#E87516] via-[#18231E] to-[#138808] dark:from-[#FFB866] dark:via-[#FFFDF8] dark:to-[#35C46A] bg-clip-text text-transparent animate-brand-gradient"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};
