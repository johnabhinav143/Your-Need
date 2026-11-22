import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  floating?: boolean;
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  maxTilt = 5.5,
  floating = false,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [canHover, setCanHover] = useState(false);

  const targetTiltRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
  const currentTiltRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || !canHover) return;

    let running = true;
    const tick = () => {
      if (!running) return;
      const el = cardRef.current;
      const t = targetTiltRef.current;
      const c = currentTiltRef.current;

      c.rx += (t.rx - c.rx) * 0.14;
      c.ry += (t.ry - c.ry) * 0.14;
      c.gx += (t.gx - c.gx) * 0.14;
      c.gy += (t.gy - c.gy) * 0.14;

      if (el) {
        const isSettled =
          !t.active && Math.abs(c.rx) < 0.02 && Math.abs(c.ry) < 0.02;
        if (isSettled) {
          el.style.transform = '';
          el.style.removeProperty('--tilt-gx');
          el.style.removeProperty('--tilt-gy');
        } else {
          el.style.transform = `perspective(1000px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) translate3d(0, ${t.active ? '-3px' : '0px'}, 0)`;
          el.style.setProperty('--tilt-gx', `${c.gx.toFixed(1)}%`);
          el.style.setProperty('--tilt-gy', `${c.gy.toFixed(1)}%`);
        }
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      running = false;
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [canHover, shouldReduceMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !canHover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(1, rect.width);
    const py = (e.clientY - rect.top) / Math.max(1, rect.height);
    targetTiltRef.current = {
      rx: (0.5 - py) * 2 * maxTilt,
      ry: (px - 0.5) * 2 * maxTilt,
      gx: px * 100,
      gy: py * 100,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    targetTiltRef.current = { rx: 0, ry: 0, gx: 50, gy: 50, active: false };
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform transition-shadow duration-300 ${
        floating && !shouldReduceMotion ? 'animate-luxury-float' : ''
      } ${className}`}
    >
      {children}
      {canHover && !shouldReduceMotion ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(360px circle at var(--tilt-gx, 50%) var(--tilt-gy, 50%), rgba(255, 153, 51, 0.14), rgba(53, 196, 106, 0.06) 45%, transparent 65%)',
          }}
        />
      ) : null}
    </div>
  );
};

interface CinematicImageFrameProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  kenBurns?: boolean;
  parallax?: boolean;
  maskReveal?: boolean;
  onErrorFallback?: React.ReactNode;
}

export const CinematicImageFrame: React.FC<CinematicImageFrameProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  imgClassName = '',
  kenBurns = false,
  parallax = false,
  maskReveal = true,
  onErrorFallback,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaWrapRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-18, 18]);

  useIsomorphicLayoutEffect(() => {
    const el = mediaWrapRef.current;
    if (!el || !el.isConnected || !maskReveal || shouldReduceMotion) return;

    let played = false;
    let disposed = false;

    const ctx = gsap.context(() => {
      gsap.set(el, {
        opacity: 0,
        scale: 1.1,
        clipPath: 'inset(7% 4% 7% 4% round 14px)',
      });
    }, el);

    const playReveal = () => {
      if (disposed || played || !el.isConnected) return;
      played = true;
      ctx.add(() => {
        gsap.to(el, {
          opacity: 1,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          duration: 0.72,
          ease: 'power3.out',
          clearProps: 'clipPath,transform,opacity',
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
  }, [src, maskReveal, shouldReduceMotion]);

  const handleImgError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={mediaWrapRef} className="w-full h-full">
        {!failed ? (
          <motion.div
            style={parallax && !shouldReduceMotion ? { y: parallaxY } : undefined}
            className="w-full h-full will-change-transform"
          >
            <img
              src={imgSrc}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={handleImgError}
              className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
                kenBurns && !shouldReduceMotion ? 'animate-ken-burns' : ''
              } ${parallax && !shouldReduceMotion ? 'scale-[1.08]' : ''} ${imgClassName}`}
            />
          </motion.div>
        ) : (
          onErrorFallback || (
            <div className="w-full h-full bg-gradient-to-br from-[#F8FAFC] to-[#E8EDF2] dark:from-[#071B16] dark:to-[#101A17]" />
          )
        )}
      </div>
    </div>
  );
};

interface Flip3DCardProps {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export const Flip3DCard: React.FC<Flip3DCardProps> = ({
  flipped,
  front,
  back,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{flipped ? back : front}</div>;
  }

  return (
    <div className={`relative ${className}`} style={{ perspective: 1200 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.62, ease: EASE_LUXURY }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        <div
          className="w-full h-full"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

interface GsapStaggerGridProps {
  children: React.ReactNode;
  className?: string;
  triggerKey?: string;
}

export const GsapStaggerGrid: React.FC<GsapStaggerGridProps> = ({
  children,
  className = '',
  triggerKey = '',
}) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = gridRef.current;
    if (!el || !el.isConnected || shouldReduceMotion) return;

    const items = (Array.from(el.children) as HTMLElement[]).filter(
      (node) => node.isConnected
    );
    if (items.length === 0) return;

    let played = false;
    let disposed = false;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 18, scale: 0.97 });
    }, el);

    const playStagger = () => {
      if (disposed || played || !el.isConnected) return;
      const activeItems = (Array.from(el.children) as HTMLElement[]).filter(
        (node) => node.isConnected
      );
      if (activeItems.length === 0) return;

      played = true;
      ctx.add(() => {
        gsap.to(activeItems, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      });
    };

    if (typeof IntersectionObserver === 'undefined') {
      playStagger();
      return () => {
        disposed = true;
        ctx.revert();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played && !disposed) {
            playStagger();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.06 }
    );

    observer.observe(el);
    return () => {
      disposed = true;
      observer.disconnect();
      ctx.revert();
    };
  }, [triggerKey, shouldReduceMotion]);

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  );
};
