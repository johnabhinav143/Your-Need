import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export interface CinematicParticlesProps {
  /** Render as a full-screen viewport background layer (`fixed inset-0`) or contained (`absolute inset-0`) */
  fullScreen?: boolean;
  /** Particle density preset */
  density?: 'subtle' | 'balanced' | 'rich';
  /** Dark-surface luminescence, light-surface amber tones, or automatic <html>.dark tracking */
  tone?: 'auto' | 'dark' | 'light';
  /** Enable thin falling golden streaks from the top */
  showStreaks?: boolean;
  /** Enable subtle ambient glows & 4-point glints */
  showGlows?: boolean;
  /** Enable gentle passive pointer parallax */
  interactive?: boolean;
  className?: string;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  depth: number;
  phase: number;
  phaseSpeed: number;
  life: number;
  maxLife: number;
  colorIdx: number;
  hasTrail: boolean;
  trailLen: number;
}

interface FallingStreak {
  x: number;
  y: number;
  vy: number;
  length: number;
  width: number;
  alpha: number;
  phase: number;
  colorIdx: number;
}

interface SubtleGlow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
  colorIdx: number;
}

interface SparkleGlint {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  colorIdx: number;
}

interface ParticleSwatch {
  rgb: string;
  haloRgb: string;
}

const DARK_SWATCHES: ParticleSwatch[] = [
  { rgb: '255, 210, 138', haloRgb: '255, 184, 102' }, // Golden highlight #FFD28A
  { rgb: '255, 184, 102', haloRgb: '255, 153, 51' },  // Light saffron glow #FFB866
  { rgb: '255, 153, 51', haloRgb: '232, 117, 22' },   // Primary saffron #FF9933
  { rgb: '255, 253, 248', haloRgb: '255, 210, 138' }, // Ivory shimmer #FFFDF8
  { rgb: '53, 196, 106', haloRgb: '125, 255, 155' },  // Subtle emerald #35C46A
];

const LIGHT_SWATCHES: ParticleSwatch[] = [
  { rgb: '232, 117, 22', haloRgb: '255, 153, 51' },   // Deep saffron #E87516
  { rgb: '217, 138, 22', haloRgb: '255, 184, 102' },  // Burnished gold
  { rgb: '255, 153, 51', haloRgb: '255, 210, 138' },  // Saffron #FF9933
  { rgb: '180, 105, 14', haloRgb: '255, 184, 102' },  // Warm amber
  { rgb: '19, 136, 8', haloRgb: '53, 196, 106' },     // Indian emerald #138808
];

function pickColorIndex(): number {
  const r = Math.random();
  if (r < 0.40) return 0; // Golden highlight
  if (r < 0.66) return 1; // Light saffron glow
  if (r < 0.82) return 2; // Primary saffron
  if (r < 0.91) return 3; // Ivory shimmer
  return 4;               // Subtle emerald accent
}

function drawSparkleGlint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rgb: string,
  alpha: number
) {
  if (alpha <= 0.01 || size <= 0.5) return;
  ctx.save();
  ctx.translate(x, y);

  const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
  aura.addColorStop(0, `rgba(${rgb}, ${alpha * 0.6})`);
  aura.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.16})`);
  aura.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(${rgb}, ${Math.min(1, alpha * 1.1)})`;
  const inner = size * 0.18;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(inner * 0.6, -inner * 0.6, size, 0);
  ctx.quadraticCurveTo(inner * 0.6, inner * 0.6, 0, size);
  ctx.quadraticCurveTo(-inner * 0.6, inner * 0.6, -size, 0);
  ctx.quadraticCurveTo(-inner * 0.6, -inner * 0.6, 0, -size);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export const CinematicParticles: React.FC<CinematicParticlesProps> = ({
  fullScreen = true,
  density = 'balanced',
  tone = 'auto',
  showStreaks = true,
  showGlows = true,
  interactive = true,
  className = '',
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isHtmlDark, setIsHtmlDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (tone !== 'auto' || typeof document === 'undefined') return;
    const root = document.documentElement;
    setIsHtmlDark(root.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsHtmlDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [tone]);

  const effectiveDark = tone === 'dark' ? true : tone === 'light' ? false : isHtmlDark;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const swatches = effectiveDark ? DARK_SWATCHES : LIGHT_SWATCHES;

    const counts =
      density === 'rich'
        ? { particles: 58, streaks: 10, glows: 5, glints: 12 }
        : density === 'balanced'
          ? { particles: 42, streaks: 7, glows: 4, glints: 9 }
          : { particles: 24, streaks: 4, glows: 3, glints: 6 };

    let width = Math.max(
      fullScreen ? window.innerWidth : wrapper.clientWidth || 360,
      1
    );
    let height = Math.max(
      fullScreen ? window.innerHeight : wrapper.clientHeight || 220,
      1
    );
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const configureSize = () => {
      width = Math.max(
        fullScreen ? window.innerWidth : wrapper.clientWidth || 360,
        1
      );
      height = Math.max(
        fullScreen ? window.innerHeight : wrapper.clientHeight || 220,
        1
      );
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    configureSize();

    // 1. Floating Golden Particles Pool
    const particles: FloatingParticle[] = [];
    for (let i = 0; i < counts.particles; i++) {
      const depth = 0.35 + Math.random() * 0.65;
      const maxLife = 6.5 + Math.random() * 7.5;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 10 * depth,
        vy: -(8 + Math.random() * 14) * depth,
        radius: (1.05 + Math.random() * 2.15) * (0.65 + depth * 0.55),
        depth,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.7 + Math.random() * 1.1,
        life: Math.random() * maxLife,
        maxLife,
        colorIdx: pickColorIndex(),
        hasTrail: depth > 0.62 && Math.random() > 0.42,
        trailLen: 11 + Math.random() * 16,
      });
    }

    // 2. Falling Light Streaks Pool
    const streaks: FallingStreak[] = [];
    if (showStreaks) {
      for (let i = 0; i < counts.streaks; i++) {
        streaks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vy: 30 + Math.random() * 34,
          length: 52 + Math.random() * 78,
          width: 0.9 + Math.random() * 0.85,
          alpha: 0.16 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
          colorIdx: i % 5 === 4 ? 4 : i % 3,
        });
      }
    }

    // 3. Subtle Ambient Glows Pool
    const glows: SubtleGlow[] = [];
    const glints: SparkleGlint[] = [];
    if (showGlows) {
      for (let i = 0; i < counts.glows; i++) {
        glows.push({
          x: width * (0.12 + Math.random() * 0.76),
          y: height * (0.1 + Math.random() * 0.72),
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 6,
          radius: Math.min(width, height) * (0.18 + Math.random() * 0.16),
          alpha: 0.045 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
          speed: 0.35 + Math.random() * 0.35,
          colorIdx: i === counts.glows - 1 ? 4 : i % 2,
        });
      }

      for (let i = 0; i < counts.glints; i++) {
        glints.push({
          x: width * (0.06 + Math.random() * 0.88),
          y: height * (0.08 + Math.random() * 0.62),
          size: 3.0 + Math.random() * 4.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.85 + Math.random() * 1.15,
          colorIdx: i % 5 === 4 ? 4 : i % 2,
        });
      }
    }

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = wrapper.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetParallaxX = nx * 18;
      targetParallaxY = ny * 12;
    };

    if (interactive && !prefersReducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            const prevW = width;
            const prevH = height;
            configureSize();
            const sx = width / Math.max(prevW, 1);
            const sy = height / Math.max(prevH, 1);
            for (let i = 0; i < particles.length; i++) {
              particles[i].x *= sx;
              particles[i].y *= sy;
            }
            for (let i = 0; i < streaks.length; i++) {
              streaks[i].x *= sx;
              streaks[i].y *= sy;
            }
            for (let i = 0; i < glows.length; i++) {
              glows[i].x *= sx;
              glows[i].y *= sy;
            }
            for (let i = 0; i < glints.length; i++) {
              glints[i].x *= sx;
              glints[i].y *= sy;
            }
          })
        : null;
    resizeObserver?.observe(wrapper);

    if (fullScreen) {
      window.addEventListener('resize', configureSize, { passive: true });
    }

    const renderFrame = (dt: number, elapsed: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);

      if (animate) {
        const damp = 1 - Math.exp(-4.2 * dt);
        parallaxX += (targetParallaxX - parallaxX) * damp;
        parallaxY += (targetParallaxY - parallaxY) * damp;
      }

      const modeOpacity = effectiveDark ? 1 : 0.72;

      // Layer A: Subtle Soft Ambient Glows
      for (let i = 0; i < glows.length; i++) {
        const g = glows[i];
        if (animate) {
          g.x += g.vx * dt;
          g.y += g.vy * dt;
          if (g.x < -g.radius * 0.3 || g.x > width + g.radius * 0.3) g.vx *= -1;
          if (g.y < -g.radius * 0.3 || g.y > height + g.radius * 0.3) g.vy *= -1;
        }
        const breath = 0.72 + 0.28 * Math.sin(elapsed * g.speed + g.phase);
        const alpha = g.alpha * breath * modeOpacity;
        const swatch = swatches[g.colorIdx] || swatches[0];
        const gx = g.x + parallaxX * 0.25;
        const gy = g.y + parallaxY * 0.25;

        const rad = ctx.createRadialGradient(gx, gy, 0, gx, gy, g.radius);
        rad.addColorStop(0, `rgba(${swatch.haloRgb}, ${alpha})`);
        rad.addColorStop(0.55, `rgba(${swatch.haloRgb}, ${alpha * 0.35})`);
        rad.addColorStop(1, `rgba(${swatch.haloRgb}, 0)`);
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(gx, gy, g.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer B: Falling Thin Golden & Tricolour Light Streaks
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        if (animate) {
          s.y += s.vy * dt;
          if (s.y - s.length > height + 20) {
            s.y = -24;
            s.x = Math.random() * width;
          }
        }
        const shimmer = 0.7 + 0.3 * Math.sin(elapsed * 1.5 + s.phase);
        const edgeFade =
          Math.min(1, Math.max(0, (s.y + s.length * 0.4) / 64)) *
          Math.min(1, Math.max(0, (height + 24 - s.y) / 72));
        const finalAlpha = s.alpha * shimmer * edgeFade * modeOpacity;
        if (finalAlpha <= 0.01) continue;

        const swatch = swatches[s.colorIdx] || swatches[0];
        const sx = s.x + parallaxX * 0.4;
        const grad = ctx.createLinearGradient(sx, s.y - s.length, sx, s.y);
        grad.addColorStop(0, `rgba(${swatch.rgb}, 0)`);
        grad.addColorStop(0.55, `rgba(${swatch.rgb}, ${finalAlpha * 0.6})`);
        grad.addColorStop(0.92, `rgba(${swatch.rgb}, ${finalAlpha})`);
        grad.addColorStop(1, `rgba(${swatch.rgb}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(sx, s.y - s.length);
        ctx.lineTo(sx, s.y);
        ctx.stroke();
      }

      // Layer C: Floating Golden Particles & Gentle Trails
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (animate) {
          p.life += dt;
          if (p.life >= p.maxLife || p.y < -24) {
            p.x = Math.random() * width;
            p.y = height + 10 + Math.random() * 20;
            p.life = 0;
            p.maxLife = 6.5 + Math.random() * 7.5;
            p.colorIdx = pickColorIndex();
          } else {
            p.x += (p.vx + Math.sin(elapsed * p.phaseSpeed + p.phase) * 7 * p.depth) * dt;
            p.y += p.vy * dt;
            if (p.x < -16) p.x = width + 16;
            if (p.x > width + 16) p.x = -16;
          }
        }

        const lifeNorm = animate ? p.life / p.maxLife : 0.48;
        const lifeFade =
          lifeNorm < 0.18
            ? lifeNorm / 0.18
            : lifeNorm > 0.78
              ? Math.max(0, (1 - lifeNorm) / 0.22)
              : 1;
        const twinkle = 0.62 + 0.38 * Math.sin(elapsed * p.phaseSpeed * 1.4 + p.phase);
        const alpha = lifeFade * twinkle * (0.34 + p.depth * 0.48) * modeOpacity;
        if (alpha <= 0.01) continue;

        const swatch = swatches[p.colorIdx] || swatches[0];
        const px = p.x + parallaxX * p.depth;
        const py = p.y + parallaxY * p.depth;

        if (p.hasTrail) {
          const trailGrad = ctx.createLinearGradient(
            px,
            py,
            px - p.vx * 0.35,
            py + p.trailLen
          );
          trailGrad.addColorStop(0, `rgba(${swatch.haloRgb}, ${alpha * 0.45})`);
          trailGrad.addColorStop(1, `rgba(${swatch.haloRgb}, 0)`);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = Math.max(0.8, p.radius * 0.7);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - p.vx * 0.35, py + p.trailLen);
          ctx.stroke();
        }

        const haloRadius = p.radius * (effectiveDark ? 3.9 : 2.9);
        const halo = ctx.createRadialGradient(px, py, 0, px, py, haloRadius);
        halo.addColorStop(0, `rgba(${swatch.rgb}, ${alpha})`);
        halo.addColorStop(0.38, `rgba(${swatch.haloRgb}, ${alpha * 0.42})`);
        halo.addColorStop(1, `rgba(${swatch.haloRgb}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${swatch.rgb}, ${Math.min(1, alpha * 1.25)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer D: Subtle Sparkling Glints
      for (let i = 0; i < glints.length; i++) {
        const gl = glints[i];
        const pulse = Math.pow(Math.max(0, Math.sin(elapsed * gl.speed + gl.phase)), 3);
        const alpha = (animate ? pulse : 0.35) * 0.72 * modeOpacity;
        const swatch = swatches[gl.colorIdx] || swatches[0];
        drawSparkleGlint(
          ctx,
          gl.x + parallaxX * 0.85,
          gl.y + parallaxY * 0.65,
          gl.size * (0.7 + 0.35 * (animate ? pulse : 0.5)),
          swatch.rgb,
          alpha
        );
      }
    };

    if (prefersReducedMotion) {
      renderFrame(0, 1.2, false);
      return () => {
        resizeObserver?.disconnect();
        if (fullScreen) {
          window.removeEventListener('resize', configureSize);
        }
      };
    }

    let rafId: number | null = null;
    let isInView = true;
    let isDisposed = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const tick = (now: number) => {
      if (isDisposed || !isInView || document.visibilityState === 'hidden') {
        rafId = null;
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;
      renderFrame(dt, elapsed, true);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isDisposed || rafId !== null || !isInView || document.visibilityState === 'hidden') {
        return;
      }
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              isInView = entry ? entry.isIntersecting : true;
              if (isInView) {
                startLoop();
              } else {
                stopLoop();
              }
            },
            { threshold: 0.01 }
          )
        : null;
    intersectionObserver?.observe(wrapper);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopLoop();
      } else {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (fullScreen) {
        window.removeEventListener('resize', configureSize);
      }
      if (interactive) {
        window.removeEventListener('pointermove', handlePointerMove);
      }
    };
  }, [
    fullScreen,
    density,
    effectiveDark,
    showStreaks,
    showGlows,
    interactive,
    prefersReducedMotion,
  ]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={`${
        fullScreen ? 'fixed inset-0 z-0' : 'absolute inset-0'
      } pointer-events-none select-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
