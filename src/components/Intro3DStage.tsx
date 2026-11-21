import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Intro3DStageProps {
  theme: 'light' | 'dark';
  selectedRole: 'customer' | 'technician';
  authMode: 'login' | 'signup' | 'quick';
  resetTrigger: number;
  fallbackPoster: string;
  onEmblemTap?: () => void;
}

// Pre-allocated scratch math helpers — zero allocations inside tick()
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();
const _dummy = new THREE.Object3D();

const COLOR_OBSIDIAN = 0x0b0b0d;
const COLOR_IVORY_SAND = 0xf4ece0;
const COLOR_GOLD = 0xd6a84f;
const COLOR_CHAMPAGNE = 0xf3d999;
const COLOR_BRONZE_GOLD = 0xa87a2a;

function detectSoftwareWebGL(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugExt) {
      const unmasked = String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) || '');
      if (/SwiftShader|llvmpipe|Software|Mesa|Microsoft Basic Render/i.test(unmasked)) {
        return true;
      }
    }
    const basicRenderer = String(gl.getParameter(gl.RENDERER) || '');
    return /SwiftShader|llvmpipe|Software|Mesa/i.test(basicRenderer);
  } catch {
    return false;
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.06,
      size / 2,
      size / 2,
      size * 0.48
    );
    grad.addColorStop(0, 'rgba(6, 6, 8, 0.84)');
    grad.addColorStop(0.5, 'rgba(6, 6, 8, 0.35)');
    grad.addColorStop(1, 'rgba(6, 6, 8, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStudioFloorTexture(isDark: boolean): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    const ringStroke = isDark ? 'rgba(214, 168, 79, 0.34)' : 'rgba(138, 98, 28, 0.28)';
    const accentStroke = isDark ? 'rgba(243, 217, 153, 0.26)' : 'rgba(18, 16, 12, 0.18)';

    [84, 136, 188, 234].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = idx % 2 === 0 ? ringStroke : accentStroke;
      ctx.lineWidth = idx === 1 ? 2 : 1.25;
      if (idx % 2 === 1) {
        ctx.setLineDash([8, 10]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    });

    ctx.setLineDash([]);
    ctx.strokeStyle = isDark ? 'rgba(243, 217, 153, 0.22)' : 'rgba(138, 98, 28, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 145, cy + Math.sin(a) * 145);
      ctx.lineTo(cx + Math.cos(a) * 168, cy + Math.sin(a) * 168);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGoldDesertDuneGeometry(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(16, 16, 56, 56);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    // Keep center flat for the plinth dais, sweep into sculpted gold dunes around perimeter
    const blend = Math.min(1, Math.max(0, (r - 1.5) / 2.6));
    const ridge1 = Math.sin(x * 0.85 + z * 0.42) * 0.34;
    const ridge2 = Math.cos(z * 0.72 - x * 0.35) * 0.28;
    const ripple = Math.sin(r * 2.4 + x * 1.1) * 0.06;
    const horizonLift = Math.max(0, -z * 0.08);
    const y = -1.24 + blend * (ridge1 + ridge2 + ripple + horizonLift + 0.12);
    pos.setY(i, y);
  }
  geo.computeVertexNormals();
  return geo;
}

function createHouseShellGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.56, -0.42);
  s.lineTo(0.56, -0.42);
  s.lineTo(0.56, 0.16);
  s.lineTo(0, 0.62);
  s.lineTo(-0.56, 0.16);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.72,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.035,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

function createRoofGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.74, 0.06);
  s.lineTo(0, 0.66);
  s.lineTo(0.74, 0.06);
  s.lineTo(0.64, -0.02);
  s.lineTo(0, 0.50);
  s.lineTo(-0.64, -0.02);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.86,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

function createGearGeometry(teeth = 10, outerR = 0.36, innerR = 0.27, holeR = 0.11): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.32;
    const a3 = a0 + step * 0.64;
    const a4 = a0 + step * 0.74;

    if (i === 0) {
      s.moveTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
    } else {
      s.lineTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
    }
    s.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
    s.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
    s.lineTo(Math.cos(a3) * outerR, Math.sin(a3) * outerR);
    s.lineTo(Math.cos(a4) * innerR, Math.sin(a4) * innerR);
  }
  s.closePath();

  const hole = new THREE.Path();
  hole.absarc(0, 0, holeR, 0, Math.PI * 2, true);
  s.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

function createWrenchGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.08, -0.58);
  s.lineTo(0.08, -0.58);
  s.quadraticCurveTo(0.11, -0.50, 0.075, -0.40);
  s.lineTo(0.075, 0.22);
  s.quadraticCurveTo(0.24, 0.30, 0.23, 0.50);
  s.lineTo(0.15, 0.62);
  s.lineTo(0.08, 0.46);
  s.lineTo(-0.08, 0.46);
  s.lineTo(-0.15, 0.62);
  s.lineTo(-0.23, 0.50);
  s.quadraticCurveTo(-0.24, 0.30, -0.075, 0.22);
  s.lineTo(-0.075, -0.40);
  s.quadraticCurveTo(-0.11, -0.50, -0.08, -0.58);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.016,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

export const Intro3DStage: React.FC<Intro3DStageProps> = ({
  theme,
  selectedRole,
  authMode,
  resetTrigger,
  fallbackPoster,
  onEmblemTap,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const stateRef = useRef({
    theme,
    selectedRole,
    authMode,
    impulse: 0,
    resetRequested: false,
  });
  const onTapRef = useRef(onEmblemTap);
  onTapRef.current = onEmblemTap;

  useEffect(() => {
    stateRef.current.theme = theme;
  }, [theme]);

  useEffect(() => {
    stateRef.current.selectedRole = selectedRole;
    stateRef.current.impulse = Math.min(1.2, stateRef.current.impulse + 0.55);
  }, [selectedRole]);

  useEffect(() => {
    stateRef.current.authMode = authMode;
    stateRef.current.impulse = Math.min(1.2, stateRef.current.impulse + 0.35);
  }, [authMode]);

  useEffect(() => {
    if (resetTrigger > 0) {
      stateRef.current.resetRequested = true;
      stateRef.current.impulse = 0.65;
    }
  }, [resetTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl =
        probeCanvas.getContext('webgl2', { antialias: true, powerPreference: 'high-performance' }) ||
        probeCanvas.getContext('webgl', { antialias: true, powerPreference: 'high-performance' });
      if (!gl) {
        setWebglFailed(true);
        return;
      }

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL(renderer);
    const initialW = Math.max(container.clientWidth, 320);
    const initialH = Math.max(container.clientHeight, 480);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initialW, initialH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const isInitiallyDark = stateRef.current.theme === 'dark';
    const fogColorDark = new THREE.Color(0x090807);
    const fogColorLight = new THREE.Color(0xeaddc2);
    scene.fog = new THREE.FogExp2(isInitiallyDark ? 0x090807 : 0xeaddc2, 0.068);

    const camera = new THREE.PerspectiveCamera(38, initialW / initialH, 0.1, 40);
    camera.position.set(0.35, 1.32, 5.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.78;
    controls.minPolarAngle = Math.PI * 0.24;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.target.set(0, 0.1, 0);
    controls.update();

    // Environment Map (PMREM + RoomEnvironment) for 24K metallic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = isInitiallyDark ? 1.2 : 1.05;

    // 3-Point Warm Gold Desert Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff1cf, 0x2a2010, isInitiallyDark ? 0.72 : 1.05);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe9b8, 2.5);
    keyLight.position.set(3.8, 5.2, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3.2;
    keyLight.shadow.camera.right = 3.2;
    keyLight.shadow.camera.top = 3.2;
    keyLight.shadow.camera.bottom = -3.2;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const goldFillLight = new THREE.PointLight(COLOR_CHAMPAGNE, 3.6, 12, 2);
    goldFillLight.position.set(-3.2, 2.2, 2.6);
    scene.add(goldFillLight);

    const bronzeRimLight = new THREE.PointLight(COLOR_GOLD, 3.8, 12, 2);
    bronzeRimLight.position.set(3.1, 1.5, -2.5);
    scene.add(bronzeRimLight);

    const disposables: Array<{ dispose: () => void }> = [
      envTarget,
      roomEnv,
      pmremGenerator,
    ];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Sculptural Gold Desert Dunes Floor Terrain
    const duneGeo = track(createGoldDesertDuneGeometry());
    const duneMat = track(
      new THREE.MeshStandardMaterial({
        color: isInitiallyDark ? 0x6b4d1b : 0xc59a4b,
        roughness: 0.78,
        metalness: 0.24,
      })
    );
    const duneMesh = new THREE.Mesh(duneGeo, duneMat);
    duneMesh.receiveShadow = true;
    scene.add(duneMesh);

    // Ground Contact Shadow & Gold Ring Calibration
    const contactTex = track(createContactShadowTexture());
    const contactGeo = track(new THREE.PlaneGeometry(3.4, 3.4));
    const contactMat = track(
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        opacity: isInitiallyDark ? 0.85 : 0.45,
        depthWrite: false,
      })
    );
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.rotation.x = -Math.PI / 2;
    contactMesh.position.y = -1.18;
    scene.add(contactMesh);

    const floorTexDark = track(createStudioFloorTexture(true));
    const floorTexLight = track(createStudioFloorTexture(false));
    const floorRingGeo = track(new THREE.PlaneGeometry(4.4, 4.4));
    const floorRingMat = track(
      new THREE.MeshBasicMaterial({
        map: isInitiallyDark ? floorTexDark : floorTexLight,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    const floorRingMesh = new THREE.Mesh(floorRingGeo, floorRingMat);
    floorRingMesh.rotation.x = -Math.PI / 2;
    floorRingMesh.position.y = -1.175;
    scene.add(floorRingMesh);

    // -----------------------------------------------------------------
    // Composite Procedural Hero Emblem ("Your Need" Black & Gold Hub)
    // -----------------------------------------------------------------
    const heroRoot = new THREE.Group();
    heroRoot.position.y = 0.08;
    scene.add(heroRoot);

    // 1) Obsidian & Gold Plinth Dais
    const plinthGroup = new THREE.Group();
    plinthGroup.position.y = -0.96;
    heroRoot.add(plinthGroup);

    const plinthMat = track(
      new THREE.MeshStandardMaterial({
        color: COLOR_OBSIDIAN,
        roughness: 0.28,
        metalness: 0.65,
      })
    );
    const goldMetalMat = track(
      new THREE.MeshPhysicalMaterial({
        color: COLOR_GOLD,
        roughness: 0.2,
        metalness: 0.94,
        clearcoat: 0.55,
        clearcoatRoughness: 0.14,
      })
    );
    const champagneGlowMat = track(
      new THREE.MeshStandardMaterial({
        color: COLOR_CHAMPAGNE,
        emissive: COLOR_GOLD,
        emissiveIntensity: 1.25,
        roughness: 0.22,
        metalness: 0.45,
      })
    );

    const plinthBaseGeo = track(new THREE.CylinderGeometry(1.18, 1.32, 0.22, 48));
    const plinthBase = new THREE.Mesh(plinthBaseGeo, plinthMat);
    plinthBase.castShadow = true;
    plinthBase.receiveShadow = true;
    plinthGroup.add(plinthBase);

    const plinthTopCapGeo = track(new THREE.CylinderGeometry(0.98, 1.12, 0.08, 48));
    const plinthTopCap = new THREE.Mesh(plinthTopCapGeo, plinthMat);
    plinthTopCap.position.y = 0.14;
    plinthTopCap.castShadow = true;
    plinthTopCap.receiveShadow = true;
    plinthGroup.add(plinthTopCap);

    const plinthGoldBevelGeo = track(new THREE.TorusGeometry(1.13, 0.028, 16, 64));
    const plinthGoldBevel = new THREE.Mesh(plinthGoldBevelGeo, goldMetalMat);
    plinthGoldBevel.rotation.x = Math.PI / 2;
    plinthGoldBevel.position.y = 0.12;
    plinthGroup.add(plinthGoldBevel);

    const plinthGlowRingGeo = track(new THREE.TorusGeometry(0.99, 0.018, 14, 64));
    const plinthGlowRing = new THREE.Mesh(plinthGlowRingGeo, champagneGlowMat);
    plinthGlowRing.rotation.x = Math.PI / 2;
    plinthGlowRing.position.y = 0.185;
    plinthGroup.add(plinthGlowRing);

    // 2) Architectural Obsidian Home Pavilion + Gold Roof
    const pavilionGroup = new THREE.Group();
    pavilionGroup.position.y = -0.18;
    heroRoot.add(pavilionGroup);

    const houseShellMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x121215,
        roughness: 0.34,
        metalness: 0.48,
        clearcoat: 0.72,
        clearcoatRoughness: 0.2,
      })
    );
    const houseShellGeo = track(createHouseShellGeometry());
    const houseShell = new THREE.Mesh(houseShellGeo, houseShellMat);
    houseShell.castShadow = true;
    houseShell.receiveShadow = true;
    pavilionGroup.add(houseShell);

    const roofGeo = track(createRoofGeometry());
    const roofMesh = new THREE.Mesh(roofGeo, goldMetalMat);
    roofMesh.position.y = 0.31;
    roofMesh.castShadow = true;
    pavilionGroup.add(roofMesh);

    const chimneyGeo = track(new THREE.BoxGeometry(0.14, 0.3, 0.14));
    const chimneyMesh = new THREE.Mesh(chimneyGeo, houseShellMat);
    chimneyMesh.position.set(0.32, 0.44, -0.14);
    chimneyMesh.castShadow = true;
    pavilionGroup.add(chimneyMesh);

    // Warm Golden Hearth Windows & Portal Doorway
    const hearthMat = track(
      new THREE.MeshStandardMaterial({
        color: COLOR_IVORY_SAND,
        emissive: COLOR_GOLD,
        emissiveIntensity: 1.35,
        roughness: 0.18,
        metalness: 0.15,
      })
    );
    const windowPaneGeo = track(new THREE.BoxGeometry(0.13, 0.13, 0.06));
    const windowOffsets: Array<[number, number]> = [
      [-0.085, 0.09],
      [0.085, 0.09],
      [-0.085, -0.075],
      [0.085, -0.075],
    ];
    windowOffsets.forEach(([wx, wy]) => {
      const pane = new THREE.Mesh(windowPaneGeo, hearthMat);
      pane.position.set(wx, wy, 0.39);
      pavilionGroup.add(pane);
    });

    const doorFrameGeo = track(new THREE.BoxGeometry(0.28, 0.36, 0.05));
    const doorFrame = new THREE.Mesh(doorFrameGeo, goldMetalMat);
    doorFrame.position.set(0, -0.34, 0.385);
    pavilionGroup.add(doorFrame);

    // 3) Floating Amber-Gold Prism Beacon Crystal
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(0, 0.86, 0);
    heroRoot.add(beaconGroup);

    const crystalMat = track(
      new THREE.MeshPhysicalMaterial({
        color: COLOR_CHAMPAGNE,
        emissive: COLOR_GOLD,
        emissiveIntensity: 0.42,
        roughness: 0.08,
        metalness: 0.12,
        transmission: isSoftwareGl ? 0.35 : 0.78,
        transparent: true,
        opacity: isSoftwareGl ? 0.9 : 1.0,
        ior: 1.56,
        thickness: 0.55,
      })
    );
    const crystalGeo = track(new THREE.OctahedronGeometry(0.27, 0));
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.castShadow = true;
    beaconGroup.add(crystalMesh);

    const coreGeo = track(new THREE.IcosahedronGeometry(0.11, 0));
    const coreMesh = new THREE.Mesh(coreGeo, goldMetalMat);
    beaconGroup.add(coreMesh);

    // 4) Precision Craftsmanship Wrench & Antique Gold Gear
    const craftGroup = new THREE.Group();
    craftGroup.position.set(0.84, 0.08, 0.34);
    heroRoot.add(craftGroup);

    const wrenchGeo = track(createWrenchGeometry());
    const wrenchMesh = new THREE.Mesh(wrenchGeo, goldMetalMat);
    wrenchMesh.rotation.z = -Math.PI * 0.14;
    wrenchMesh.castShadow = true;
    craftGroup.add(wrenchMesh);

    const gearMat = track(
      new THREE.MeshPhysicalMaterial({
        color: COLOR_BRONZE_GOLD,
        roughness: 0.24,
        metalness: 0.88,
        clearcoat: 0.4,
      })
    );
    const gearGeo = track(createGearGeometry(10, 0.35, 0.26, 0.10));
    const gearMesh = new THREE.Mesh(gearGeo, gearMat);
    gearMesh.position.set(-1.66, -0.04, -0.22);
    gearMesh.castShadow = true;
    craftGroup.add(gearMesh);

    // 5) Twin Gold Gyroscopic Orbit Rings + Champagne Satellites
    const orbitGroup = new THREE.Group();
    orbitGroup.position.y = 0.08;
    heroRoot.add(orbitGroup);

    const outerOrbitGeo = track(new THREE.TorusGeometry(1.42, 0.022, 16, 84));
    const outerOrbit = new THREE.Mesh(outerOrbitGeo, goldMetalMat);
    outerOrbit.rotation.x = Math.PI * 0.38;
    outerOrbit.rotation.y = Math.PI * 0.12;
    orbitGroup.add(outerOrbit);

    const innerOrbitMat = track(
      new THREE.MeshStandardMaterial({
        color: COLOR_CHAMPAGNE,
        emissive: COLOR_GOLD,
        emissiveIntensity: 0.45,
        roughness: 0.22,
        metalness: 0.86,
      })
    );
    const innerOrbitGeo = track(new THREE.TorusGeometry(1.16, 0.016, 14, 72));
    const innerOrbit = new THREE.Mesh(innerOrbitGeo, innerOrbitMat);
    innerOrbit.rotation.x = -Math.PI * 0.32;
    innerOrbit.rotation.z = Math.PI * 0.18;
    orbitGroup.add(innerOrbit);

    const nodeGeo = track(new THREE.SphereGeometry(0.068, 20, 20));
    const satGold = new THREE.Mesh(nodeGeo, champagneGlowMat);
    satGold.position.set(1.42, 0, 0);
    outerOrbit.add(satGold);

    const satBronzeMat = track(
      new THREE.MeshStandardMaterial({
        color: COLOR_GOLD,
        emissive: COLOR_CHAMPAGNE,
        emissiveIntensity: 1.1,
        roughness: 0.2,
        metalness: 0.5,
      })
    );
    const satBronze = new THREE.Mesh(nodeGeo, satBronzeMat);
    satBronze.position.set(-1.16, 0, 0);
    innerOrbit.add(satBronze);

    // 6) Instanced Golden Desert Sand Sparks (48 floating dust grains)
    const sparkCount = 48;
    const sparkGeo = track(new THREE.OctahedronGeometry(0.024, 0));
    const sparkMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: COLOR_GOLD,
        emissiveIntensity: 0.95,
        roughness: 0.2,
        metalness: 0.78,
      })
    );
    const sparkInstanced = new THREE.InstancedMesh(sparkGeo, sparkMat, sparkCount);
    const sparkData: Array<{ angle: number; radius: number; yBase: number; speed: number; phase: number }> = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + (i % 5) * 0.37;
      const radius = 1.25 + (i % 7) * 0.21;
      const yBase = -0.82 + ((i * 0.29) % 2.25);
      const speed = 0.2 + (i % 4) * 0.075;
      const phase = i * 0.65;
      sparkData.push({ angle, radius, yBase, speed, phase });

      if (i % 3 === 0) _colorA.setHex(COLOR_GOLD);
      else if (i % 3 === 1) _colorA.setHex(COLOR_CHAMPAGNE);
      else _colorA.setHex(COLOR_BRONZE_GOLD);
      sparkInstanced.setColorAt(i, _colorA);
    }
    if (sparkInstanced.instanceColor) sparkInstanced.instanceColor.needsUpdate = true;
    scene.add(sparkInstanced);

    // Click / Tap Raycasting on the Hero Emblem
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 36) return;

      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObject(heroRoot, true);
      if (hits.length > 0) {
        stateRef.current.impulse = 1.15;
        onTapRef.current?.();
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      setWebglFailed(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.round(entry.contentRect.width), 1);
      const h = Math.max(Math.round(entry.contentRect.height), 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let rafId = 0;
    let timerId: number | null = null;
    let disposed = false;
    const clock = new THREE.Clock();

    const afterDraw = (cb: () => void) => {
      if (isSoftwareGl) {
        timerId = window.setTimeout(cb, 32);
      } else {
        rafId = requestAnimationFrame(cb);
      }
    };

    const tick = () => {
      if (disposed) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const s = stateRef.current;

      const isDark = s.theme === 'dark';
      _colorA.copy(isDark ? fogColorDark : fogColorLight);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(_colorA, 1 - Math.exp(-6 * dt));
      }
      _colorB.setHex(isDark ? 0x6b4d1b : 0xc59a4b);
      duneMat.color.lerp(_colorB, 1 - Math.exp(-5 * dt));

      scene.environmentIntensity = THREE.MathUtils.damp(
        scene.environmentIntensity,
        isDark ? 1.2 : 1.02,
        5,
        dt
      );
      hemiLight.intensity = THREE.MathUtils.damp(hemiLight.intensity, isDark ? 0.72 : 1.05, 5, dt);
      contactMat.opacity = THREE.MathUtils.damp(contactMat.opacity, isDark ? 0.85 : 0.45, 5, dt);
      const targetFloorTex = isDark ? floorTexDark : floorTexLight;
      if (floorRingMat.map !== targetFloorTex) {
        floorRingMat.map = targetFloorTex;
        floorRingMat.needsUpdate = true;
      }

      const isTech = s.selectedRole === 'technician';
      const isSignUp = s.authMode === 'signup';
      _colorB.setHex(isTech || isSignUp ? COLOR_GOLD : COLOR_CHAMPAGNE);
      crystalMat.color.lerp(_colorB, 1 - Math.exp(-6 * dt));
      champagneGlowMat.color.lerp(_colorB, 1 - Math.exp(-6 * dt));
      innerOrbitMat.color.lerp(_colorB, 1 - Math.exp(-6 * dt));

      s.impulse = THREE.MathUtils.damp(s.impulse, 0, 4.5, dt);

      if (s.resetRequested) {
        _vec3A.set(0.35, 1.32, 5.2);
        camera.position.lerp(_vec3A, 1 - Math.exp(-7 * dt));
        _vec3B.set(0, 0.1, 0);
        controls.target.lerp(_vec3B, 1 - Math.exp(-7 * dt));
        if (camera.position.distanceTo(_vec3A) < 0.03) {
          s.resetRequested = false;
        }
      }

      heroRoot.rotation.y += dt * (0.28 + s.impulse * 2.2);
      heroRoot.position.y = 0.08 + Math.sin(t * 1.45) * 0.045;

      beaconGroup.position.y = 0.88 + Math.sin(t * 2.1 + 0.6) * 0.065;
      crystalMesh.rotation.y = t * 0.9 + s.impulse * 1.5;
      coreMesh.rotation.y = -t * 1.4;
      coreMesh.rotation.x = t * 0.7;

      const targetCraftScale = isTech ? 1.18 : 0.94;
      const curCraftScale = THREE.MathUtils.damp(craftGroup.scale.x, targetCraftScale, 6, dt);
      craftGroup.scale.setScalar(curCraftScale);
      wrenchMesh.position.y = Math.sin(t * 1.9 + 1.2) * 0.06;
      wrenchMesh.rotation.y = Math.sin(t * 1.1) * 0.32;
      gearMesh.rotation.z = t * (isTech ? 1.35 : 0.65);

      outerOrbit.rotation.z = t * 0.35;
      innerOrbit.rotation.y = -t * 0.52;

      for (let i = 0; i < sparkCount; i++) {
        const sp = sparkData[i];
        const a = sp.angle + t * sp.speed;
        const y = sp.yBase + Math.sin(t * 1.4 + sp.phase) * 0.14;
        const sc = 0.7 + 0.45 * Math.sin(t * 2.2 + sp.phase);
        _dummy.position.set(Math.cos(a) * sp.radius, y, Math.sin(a) * sp.radius);
        _dummy.rotation.set(t * 0.8 + sp.phase, t * 1.1, 0);
        _dummy.scale.setScalar(sc);
        _dummy.updateMatrix();
        sparkInstanced.setMatrixAt(i, _dummy.matrix);
      }
      sparkInstanced.instanceMatrix.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
      afterDraw(tick);
    };

    tick();

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId !== null) clearTimeout(timerId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      disposables.forEach((item) => {
        try {
          item.dispose();
        } catch {
          // Ignore already disposed items
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="relative w-full h-full bg-[#08080A]">
        <img
          src={fallbackPoster}
          alt="Your Need — Luxury Gold Desert Home Services"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08080A]/80 via-transparent to-[#08080A]/95" />
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
