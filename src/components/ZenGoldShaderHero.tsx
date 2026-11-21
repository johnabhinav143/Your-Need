import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ArrowRight, Compass, Sparkles, Wrench } from 'lucide-react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ZenGoldShaderHeroProps {
  regionName: string;
  currencyCode: string;
  readyTechCount: number;
  variant?: 'full' | 'compact';
  onExploreServices: () => void;
  onBecomeProvider: () => void;
}

const WAVE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const WAVE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uMouseActive;
  uniform float uReducedMotion;

  // Compact 2D value noise & FBM for flowing liquid-metal desert dunes
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.84, -0.54, 0.54, 0.84);
    for (int i = 0; i < 4; i++) {
      v += amp * noise2D(p);
      p = rot * p * 2.02 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  // Height field describing sculpted metallic gold desert waves
  float waveHeight(vec2 uv, vec2 aspectUv, float t, vec2 mouseAspect) {
    vec2 flow = aspectUv * vec2(1.35, 1.9);

    // Subtle pointer gravity & ripple
    vec2 delta = aspectUv - mouseAspect;
    float dist = length(delta);
    float pointerWave = sin(dist * 11.0 - t * 2.8) * exp(-dist * 2.2) * 0.14 * uMouseActive;
    float pointerLift = exp(-dist * 1.9) * 0.18 * uMouseActive;

    // Warped flowing dune layers
    float warp1 = fbm(flow * 0.85 + vec2(t * 0.14, -t * 0.08));
    float warp2 = fbm(flow * 1.45 - vec2(t * 0.11, t * 0.16) + warp1 * 0.9);

    float ridgeA = sin(flow.x * 2.4 + warp1 * 3.8 - t * 0.55);
    float ridgeB = cos(flow.y * 2.9 - warp2 * 3.1 + t * 0.42);
    float duneCrest = pow(abs(sin((flow.x * 0.75 + flow.y * 0.95) * 2.1 + warp2 * 2.6 - t * 0.35)), 1.65);

    return (ridgeA * 0.24 + ridgeB * 0.18 + duneCrest * 0.48 + warp2 * 0.32) + pointerWave + pointerLift;
  }

  void main() {
    float aspect = max(uResolution.x / max(uResolution.y, 1.0), 0.5);
    vec2 centered = vUv - 0.5;
    vec2 aspectUv = vec2(centered.x * aspect, centered.y);
    vec2 mouseAspect = vec2((uMouse.x - 0.5) * aspect, uMouse.y - 0.5);

    float t = uReducedMotion > 0.5 ? 2.4 : uTime;

    float hC = waveHeight(vUv, aspectUv, t, mouseAspect);
    float eps = 0.0085;
    float hX = waveHeight(vUv, aspectUv + vec2(eps, 0.0), t, mouseAspect);
    float hY = waveHeight(vUv, aspectUv + vec2(0.0, eps), t, mouseAspect);

    // Sculpt surface normal from height gradient
    vec3 normal = normalize(vec3((hC - hX) * 4.2, (hC - hY) * 4.2, 0.38));

    // Key directional light + pointer specular rim light
    vec3 lightDir = normalize(vec3(-0.35 + (uMouse.x - 0.5) * 0.65, 0.55 + (uMouse.y - 0.5) * 0.45, 0.82));
    vec3 rimDir = normalize(vec3(0.65, -0.35, 0.55));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    float diff = max(dot(normal, lightDir), 0.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 34.0);
    float broadSpec = pow(max(dot(normal, halfVec), 0.0), 7.5);
    float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.6) * max(dot(normal, rimDir) * 0.5 + 0.5, 0.0);

    // Metallic Gold #D6AE53 Palette
    vec3 obsidian = vec3(0.028, 0.027, 0.035);
    vec3 deepBronze = vec3(0.22, 0.15, 0.045);
    vec3 antiqueGold = vec3(0.62, 0.46, 0.16);
    vec3 metallicGold = vec3(0.839, 0.682, 0.325); // #D6AE53
    vec3 champagneHighlight = vec3(0.985, 0.905, 0.68);

    // Map wave height & specular curvature to brushed liquid-gold tones
    float crestMask = smoothstep(-0.15, 0.85, hC);
    float ribbonBand = smoothstep(0.56, 0.78, sin(hC * 9.0 + aspectUv.x * 2.0 - t * 0.35) * 0.5 + 0.5);

    vec3 color = mix(obsidian, deepBronze, crestMask * 0.65);
    color = mix(color, antiqueGold, smoothstep(0.32, 0.88, crestMask) * (0.45 + 0.55 * diff));
    color += metallicGold * broadSpec * 0.58;
    color += metallicGold * ribbonBand * (0.28 + 0.45 * diff);
    color += champagneHighlight * spec * 0.92;
    color += metallicGold * rim * 0.34;

    // Warm cursor aura in metallic gold
    float pointerDist = length(aspectUv - mouseAspect);
    float pointerGlow = exp(-pointerDist * 2.8) * 0.22 * uMouseActive;
    color += mix(metallicGold, champagneHighlight, 0.4) * pointerGlow;

    // Horizon & bottom editorial vignette so headline & CTAs remain ultra-legible
    float leftReadabilityMask = smoothstep(-0.15, 0.85, vUv.x);
    float radialVignette = smoothstep(1.18, 0.18, length(centered * vec2(1.05, 1.25)));
    color *= mix(0.62, 1.0, radialVignette);
    color = mix(obsidian * 1.15, color, mix(0.66, 1.0, leftReadabilityMask * 0.55 + 0.45));

    gl_FragColor = vec4(color, 1.0);
  }
`;

const PARTICLE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uReducedMotion;

  attribute float aScale;
  attribute float aPhase;

  varying float vAlpha;

  void main() {
    float t = uReducedMotion > 0.5 ? 0.0 : uTime;

    vec3 pos = position;
    pos.y += mod(t * 0.18 + aPhase, 3.6) - 1.8;
    pos.x += sin(t * 0.45 + aPhase * 3.1) * 0.16 + (uMouse.x - 0.5) * 0.35 * (0.4 + aScale);
    pos.y += (uMouse.y - 0.5) * 0.22 * (0.4 + aScale);
    pos.z += cos(t * 0.35 + aPhase * 2.2) * 0.14;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (11.0 * aScale + 4.0) * uPixelRatio * (1.0 / max(-mvPosition.z, 0.5));

    // Smooth vertical fade near top and bottom edges
    float edgeFade = smoothstep(-1.75, -0.7, pos.y) * smoothstep(1.75, 0.7, pos.y);
    float twinkle = 0.58 + 0.42 * sin(t * 1.6 + aPhase * 6.28);
    vAlpha = edgeFade * twinkle * 0.72;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, 2.2);
    vec3 goldCore = mix(vec3(0.839, 0.682, 0.325), vec3(1.0, 0.94, 0.76), glow);
    gl_FragColor = vec4(goldCore, glow * vAlpha);
  }
`;

function probeWebGLSupport(): { supported: boolean; isSoftwareGl: boolean } {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { supported: false, isSoftwareGl: false };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2', { powerPreference: 'high-performance' }) as
        | WebGL2RenderingContext
        | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) {
      return { supported: false, isSoftwareGl: false };
    }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererString = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const isSoftwareGl = /swiftshader|software|llvmpipe|mesa/i.test(rendererString);

    const loseExt = gl.getExtension('WEBGL_lose_context');
    if (loseExt) {
      loseExt.loseContext();
    }
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: false };
  }
}

export const ZenGoldShaderHero: React.FC<ZenGoldShaderHeroProps> = ({
  regionName,
  currencyCode,
  readyTechCount,
  variant = 'compact',
  onExploreServices,
  onBecomeProvider,
}) => {
  const isCompact = variant === 'compact';
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [webglActive, setWebglActive] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Track reduced motion preference dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // GSAP Entrance Timeline for Typography & CTAs (guards optional elements like .yn-hero-meta in compact mode)
  useIsomorphicLayoutEffect(() => {
    const root = contentRef.current;
    if (!root || !root.isConnected || reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      const addFromIfMounted = (
        selector: string,
        vars: gsap.TweenVars,
        position?: gsap.Position
      ) => {
        const targets = Array.from(
          root.querySelectorAll<HTMLElement>(selector)
        ).filter((el) => el.isConnected);
        if (targets.length === 0) return;
        const hasPreviousTweens = tl.getChildren(false, true, false).length > 0;
        if (hasPreviousTweens && position !== undefined) {
          tl.from(targets, vars, position);
        } else {
          tl.from(targets, vars);
        }
      };

      addFromIfMounted('.yn-hero-eyebrow', {
        y: 16,
        opacity: 0,
        duration: 0.55,
        clearProps: 'transform,opacity',
      });
      addFromIfMounted(
        '.yn-hero-title',
        {
          y: 28,
          opacity: 0,
          scale: 0.97,
          duration: 0.72,
          clearProps: 'transform,opacity',
        },
        '-=0.35'
      );
      addFromIfMounted(
        '.yn-hero-subtitle',
        {
          y: 18,
          opacity: 0,
          duration: 0.58,
          clearProps: 'transform,opacity',
        },
        '-=0.45'
      );
      addFromIfMounted(
        '.yn-hero-ctas',
        {
          y: 16,
          opacity: 0,
          duration: 0.52,
          clearProps: 'transform,opacity',
        },
        '-=0.38'
      );
      addFromIfMounted(
        '.yn-hero-meta',
        {
          y: 12,
          opacity: 0,
          duration: 0.45,
          clearProps: 'transform,opacity',
        },
        '-=0.3'
      );
    }, root);

    return () => ctx.revert();
  }, [reducedMotion, isCompact]);

  // Procedural Three.js WebGL Liquid-Gold Shader + Particle Light Field
  useEffect(() => {
    const mount = canvasMountRef.current;
    const section = sectionRef.current;
    if (!mount || !section) return;

    const { supported, isSoftwareGl } = probeWebGLSupport();
    if (!supported) {
      setWebglActive(false);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
      });
    } catch {
      setWebglActive(false);
      return;
    }

    setWebglActive(true);
    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const initialWidth = Math.max(mount.clientWidth || section.clientWidth || 640, 2);
    const initialHeight = Math.max(mount.clientHeight || section.clientHeight || 420, 2);
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    // Scene 1: Procedural Shader Background Plane
    const waveScene = new THREE.Scene();
    const waveCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const waveUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(initialWidth * dpr, initialHeight * dpr) },
      uMouse: { value: new THREE.Vector2(0.55, 0.5) },
      uMouseActive: { value: 0.35 },
      uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
    };

    const waveGeometry = new THREE.PlaneGeometry(2, 2);
    const waveMaterial = new THREE.ShaderMaterial({
      vertexShader: WAVE_VERTEX_SHADER,
      fragmentShader: WAVE_FRAGMENT_SHADER,
      uniforms: waveUniforms,
      depthWrite: false,
      depthTest: false,
    });
    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.frustumCulled = false;
    waveScene.add(waveMesh);

    // Scene 2: Floating Golden Light Particles (Additive Points)
    const particleScene = new THREE.Scene();
    const particleCamera = new THREE.PerspectiveCamera(48, initialWidth / initialHeight, 0.1, 20);
    particleCamera.position.z = 3.2;

    const particleCount = isSoftwareGl ? 36 : 84;
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6.4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
      scales[i] = 0.35 + Math.random() * 0.95;
      phases[i] = Math.random() * 4.0;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const particleUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
      uMouse: { value: new THREE.Vector2(0.55, 0.5) },
      uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
    };

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      uniforms: particleUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particleScene.add(particles);

    // Pre-allocated state for zero-GC animation loop
    const targetMouse = new THREE.Vector2(0.55, 0.5);
    let targetMouseActive = 0.35;
    let isContextLost = false;
    let isInView = true;
    let isDisposed = false;
    let rafId: number | null = null;
    let timerId: number | null = null;
    let elapsedTime = 0;
    let lastTimestamp = performance.now();

    const updateMouseFromPointer = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = THREE.MathUtils.clamp((clientX - rect.left) / rect.width, 0, 1);
      const ny = THREE.MathUtils.clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
      targetMouse.set(nx, ny);
      targetMouseActive = 1.0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateMouseFromPointer(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      targetMouse.set(0.55, 0.5);
      targetMouseActive = 0.35;
    };

    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    const updateSize = () => {
      if (!renderer || isDisposed) return;
      const width = Math.max(mount.clientWidth || section.clientWidth || 640, 2);
      const height = Math.max(mount.clientHeight || section.clientHeight || 420, 2);
      const currentDpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(width, height, false);
      waveUniforms.uResolution.value.set(width * currentDpr, height * currentDpr);
      particleUniforms.uPixelRatio.value = currentDpr;
      particleCamera.aspect = width / height;
      particleCamera.updateProjectionMatrix();
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    resizeObserver?.observe(section);
    window.addEventListener('resize', updateSize, { passive: true });

    const renderFrame = () => {
      if (!renderer || isContextLost || isDisposed) return;
      renderer.autoClear = true;
      renderer.render(waveScene, waveCamera);
      if (!reducedMotion) {
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(particleScene, particleCamera);
      }
    };

    const afterDraw = (next: () => void) => {
      if (!renderer) return;
      const gl = renderer.getContext();
      gl.finish();
      timerId = window.setTimeout(next, 33);
    };

    const scheduleNext = () => {
      if (isDisposed || reducedMotion || !isInView || document.visibilityState === 'hidden') {
        return;
      }
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
      lastTimestamp = now;

      elapsedTime += dt;
      const dampFactor = 1 - Math.exp(-5.5 * dt);

      waveUniforms.uTime.value = elapsedTime;
      waveUniforms.uMouse.value.lerp(targetMouse, dampFactor);
      waveUniforms.uMouseActive.value +=
        (targetMouseActive - waveUniforms.uMouseActive.value) * dampFactor;

      particleUniforms.uTime.value = elapsedTime;
      particleUniforms.uMouse.value.copy(waveUniforms.uMouse.value);

      renderFrame();
      scheduleNext();
    };

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const startOrRenderStatic = () => {
      stopLoop();
      lastTimestamp = performance.now();
      renderFrame();
      if (!reducedMotion && isInView && document.visibilityState !== 'hidden') {
        scheduleNext();
      }
    };

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              isInView = entry ? entry.isIntersecting : true;
              if (isInView) {
                startOrRenderStatic();
              } else {
                stopLoop();
              }
            },
            { threshold: 0.02 }
          )
        : null;
    intersectionObserver?.observe(section);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopLoop();
      } else {
        startOrRenderStatic();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      isContextLost = true;
      stopLoop();
      setWebglActive(false);
    };

    const handleContextRestored = () => {
      isContextLost = false;
      setWebglActive(true);
      updateSize();
      startOrRenderStatic();
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    startOrRenderStatic();

    return () => {
      isDisposed = true;
      stopLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        waveGeometry.dispose();
        waveMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, [reducedMotion]);

  return (
    <div
      ref={sectionRef}
      className={`relative rounded-2xl overflow-hidden border border-[#D6AE53]/28 bg-[#141414] text-white ${
        isCompact
          ? 'shadow-[0_12px_32px_-20px_rgba(0,0,0,0.75)]'
          : 'mb-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)]'
      }`}
    >
      {/* Procedural Obsidian + Metallic Gold Fallback Backdrop (active when WebGL unavailable or context lost) */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          webglActive ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background:
            'radial-gradient(115% 85% at 78% 22%, rgba(214, 174, 83, 0.28) 0%, rgba(158, 118, 40, 0.14) 38%, rgba(8, 8, 8, 0.98) 78%), linear-gradient(135deg, #080808 0%, #141414 55%, #080808 100%)',
        }}
      />

      {/* Dedicated WebGL Mount Layer (isolated from React overlay DOM) */}
      <div
        ref={canvasMountRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none"
      />

      {/* Measured Readability Scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#080808]/92 via-[#080808]/68 to-[#080808]/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6AE53]/55 to-transparent pointer-events-none"
      />

      {/* Foreground Semantic Content & Interactive Controls */}
      <div
        ref={contentRef}
        className={
          isCompact
            ? 'relative z-10 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5'
            : 'relative z-10 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8'
        }
      >
        <div className={isCompact ? 'max-w-xl space-y-3' : 'max-w-2xl space-y-5'}>
          {/* Editorial Eyebrow */}
          <div className="yn-hero-eyebrow flex items-center gap-2 text-xs font-medium text-[#D6AE53]">
            <Sparkles className="w-3.5 h-3.5 text-[#D6AE53] shrink-0" />
            <span className="truncate">
              {regionName} · {currencyCode} · {readyTechCount} Pros Ready
            </span>
          </div>

          {/* Main Metallic Gold Heading */}
          <div className="yn-hero-title relative inline-block">
            <h1
              className={`relative font-brand font-bold tracking-[0.04em] leading-[1.08] text-[#D6AE53] ${
                isCompact ? 'text-2xl sm:text-[28px]' : 'text-4xl sm:text-5xl lg:text-6xl'
              }`}
            >
              YourNeed
            </h1>
          </div>

          {/* Brand Subtitle */}
          <p
            className={`yn-hero-subtitle text-white/90 font-normal leading-relaxed ${
              isCompact ? 'text-sm max-w-md' : 'font-display text-xl sm:text-2xl max-w-xl'
            }`}
          >
            Find Services. Connect Easily. Get Things Done.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="yn-hero-ctas pt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onExploreServices}
              className={`${
                isCompact ? 'min-h-[44px] px-5 py-2.5 text-xs' : 'min-h-[48px] px-6 py-3 text-sm'
              } rounded-xl bg-[#D6AE53] text-[#080808] font-bold hover:brightness-105 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onBecomeProvider}
              className={`${
                isCompact ? 'min-h-[44px] px-4 py-2.5 text-xs' : 'min-h-[48px] px-5 py-3 text-sm'
              } rounded-xl bg-[#1C1C1C]/95 border border-white/[0.12] text-white font-semibold hover:border-[#D6AE53]/60 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0`}
            >
              <Wrench className="w-3.5 h-3.5 text-[#D6AE53] shrink-0" />
              <span>Become a Service Provider</span>
            </button>
          </div>
        </div>

        {/* Right Editorial Metric Anchors (Only in Full mode) */}
        {!isCompact ? (
          <div className="yn-hero-meta grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:w-64 shrink-0">
            <div className="rounded-xl bg-[#1C1C1C]/95 border border-white/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-[#A0A0A0] font-semibold">
                Verified Specialists
              </p>
              <p className="font-display text-2xl font-bold text-[#D6AE53] tabular-nums mt-0.5">
                {readyTechCount}+ Active
              </p>
            </div>
            <div className="rounded-xl bg-[#1C1C1C]/95 border border-white/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-[#A0A0A0] font-semibold">
                Dispatch Standard
              </p>
              <p className="font-display text-xl font-bold text-white mt-0.5">
                Live Quote Approval
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#1C1C1C]/95 border border-white/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-[#A0A0A0] font-semibold">
                Coverage Currency
              </p>
              <p className="font-display text-xl font-bold text-[#D6AE53] mt-0.5">
                {regionName} · {currencyCode}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
