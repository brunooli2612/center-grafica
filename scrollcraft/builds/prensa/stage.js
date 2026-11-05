// Heidelberg GTO 52 studio stage: pale studio, soft shadows, studio envmap, GTAO and bloom.
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {Pass} from 'three/addons/postprocessing/Pass.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {buildPress} from './press.js';

const D2R = Math.PI / 180;
const V3 = THREE.Vector3;

export const BG = {
  top: '#faf9f6',
  mid: '#f2f0ea',
  low: '#e8e5dc',
};

// 5 Camera presets from SPEC §5
export const CAMS = {
  hero: {
    id: 'hero',
    name: 'hero',
    label: 'Máquina',
    tx: 0.0,
    ty: 0.22,
    tz: 0.0,
    az: 28 * D2R,
    el: 14 * D2R,
    d: 1.85,
    hideFrontFrame: false,
  },
  lado: {
    id: 'lado',
    name: 'lado',
    label: 'Corte',
    tx: 0.0,
    ty: 0.22,
    tz: 0.0,
    az: 0.0,
    el: 0.0,
    d: 2.15,
    hideFrontFrame: true,
  },
  tinta: {
    id: 'tinta',
    name: 'tinta',
    label: 'Tinta',
    tx: -0.02,
    ty: 0.42,
    tz: 0.0,
    az: 32 * D2R,
    el: 24 * D2R,
    d: 0.95,
    hideFrontFrame: false,
  },
  molha: {
    id: 'molha',
    name: 'molha',
    label: 'Molha',
    tx: 0.10,
    ty: 0.29,
    tz: 0.0,
    az: 26 * D2R,
    el: 16 * D2R,
    d: 0.85,
    hideFrontFrame: false,
  },
  // chapa and blanqueta: 3/4 close on the CHA-BLA pair so the plate image (readable) and blanket (mirrored) show
  cilindros: {
    id: 'cilindros',
    name: 'cilindros',
    label: 'Cilindros',
    tx: -0.04,
    ty: 0.20,
    tz: 0.0,
    az: 24 * D2R,
    el: 6 * D2R,
    d: 1.45,
    hideFrontFrame: true,
  },
  folha: {
    id: 'folha',
    name: 'folha',
    label: 'Folha',
    tx: -0.10,
    ty: 0.02,
    tz: 0.0,
    az: -38 * D2R,
    el: 8 * D2R,
    d: 1.05,
    hideFrontFrame: false,
  },
};

class TogglePass extends Pass {
  constructor(fn) {
    super();
    this.needsSwap = false;
    this.fn = fn;
  }
  render() {
    this.fn();
  }
}

export function createPressStage({canvas, look = {}}) {
  const lo = !!look.lo;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = lo ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  // Subtle studio backdrop gradient
  {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 512;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, BG.top);
    gr.addColorStop(0.55, BG.mid);
    gr.addColorStop(1, BG.low);
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
  }

  const camera = new THREE.PerspectiveCamera(28, 16 / 9, 0.05, 50);

  // Postprocessing composer
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(4, 4, {
      type: THREE.HalfFloatType,
      samples: lo ? 0 : 4,
    })
  );
  composer.addPass(new RenderPass(scene, camera));

  // GTAO Pass
  const gtao = new GTAOPass(scene, camera, 4, 4);
  gtao.output = GTAOPass.OUTPUT.Default;
  gtao.blendIntensity = look.ao ?? 0.65;
  gtao.updateGtaoMaterial({
    radius: 0.06,
    distanceExponent: 1.4,
    thickness: 0.5,
    scale: 1.0,
    samples: 16,
    distanceFallOff: 1.0,
    screenSpaceRadius: false,
  });
  gtao.updatePdMaterial({lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16});

  // Floor shadow catcher stays out of GTAO pass
  const aoSkip = (on) => {
    floorShade.visible = on;
  };
  composer.addPass(new TogglePass(() => aoSkip(false)));
  composer.addPass(gtao);
  composer.addPass(new TogglePass(() => aoSkip(true)));
  if (lo) gtao.enabled = false;

  // Light bloom under 1.0: threshold 1.0 so pale paper/background never blooms
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(4, 4), 0.22, 0.4, 1.02);
  composer.addPass(bloomPass);

  composer.addPass(new OutputPass());

  // Studio lighting: top softbox, front fill, rim kickers
  if (!lo) {
    const env = new THREE.Scene();
    env.background = new THREE.Color('#dcdde0');
    const box = (w, h, pos, k) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(1, 1, 1).multiplyScalar(k),
          side: THREE.DoubleSide,
        })
      );
      m.position.copy(pos);
      m.lookAt(0, 0.2, 0);
      env.add(m);
    };
    box(10, 10, new V3(0, 12, 1), 1.4);
    box(4, 12, new V3(-10, 3, 5), 1.6);
    box(4, 12, new V3(10, 3, -3), 1.2);
    box(14, 3, new V3(0, 2, 10), 1.0);

    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.04).texture;
    scene.environmentIntensity = 0.5; // ~0.5 on metal per spec
    pm.dispose();
  }

  // Key directional light with soft shadow
  const sun = new THREE.DirectionalLight('#ffffff', 1.6);
  sun.position.set(1.4, 3.4, 2.2);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, {
    left: -0.75,
    right: 0.75,
    top: 0.75,
    bottom: -0.75,
    near: 0.5,
    far: 8,
  });
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 8;
  sun.shadow.blurSamples = 20;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.002;
  scene.add(sun, sun.target);

  const hemi = new THREE.HemisphereLight('#ffffff', '#cfd2d6', 0.55);
  scene.add(hemi);

  // Shadow catcher on floor
  const FLOOR_Y = -0.145;
  const floorShade = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.ShadowMaterial({
      color: '#4e545d',
      opacity: 0.28,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -8,
    })
  );
  floorShade.rotation.x = -Math.PI / 2;
  floorShade.position.y = FLOOR_Y;
  floorShade.receiveShadow = true;
  scene.add(floorShade);

  // Press mechanism
  const press = buildPress(look.press || {});
  scene.add(press.group);

  const size = {w: 1600, h: 900};
  const resize = (w, h, pr) => {
    size.w = w;
    size.h = h;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  /**
   * frame(state, cam, ops): poses the press for th (degrees) and draws one frame.
   */
  const frame = (state, cam, ops = {}) => {
    const th = typeof state === 'number' ? state : state?.th ?? 0;
    const ghost = typeof state === 'object' ? state?.ghost : ops?.ghost ?? null;
    if (ghost !== undefined && ghost !== null) {
      press.setGhost(ghost);
    } else if (ops.restoreMaterials) {
      press.setGhost(null);
    }

    const c = typeof cam === 'string' ? CAMS[cam] || CAMS.hero : cam || CAMS.hero;
    const hideFront = ops.hideFrontFrame !== undefined ? !!ops.hideFrontFrame : (c.hideFrontFrame || c.id === 'lado');
    press.parts.frameFront.visible = !hideFront;

    press.update(th);

    const {tx = 0, ty = 0.22, tz = 0, az = 0, el = 0, d = 1.85, sx = 0, sy = 0} = c;
    const cosEl = Math.cos(el);
    camera.position.set(
      tx + d * cosEl * Math.sin(az),
      ty + d * Math.sin(el),
      tz + d * cosEl * Math.cos(az)
    );
    camera.lookAt(tx, ty, tz);

    if (sx || sy) {
      camera.setViewOffset(size.w, size.h, -sx, -sy, size.w, size.h);
    } else {
      camera.clearViewOffset();
    }
    camera.updateMatrixWorld();

    composer.render();
  };

  const pv = new V3();
  const project = (x, y, z) => {
    pv.set(x, y, z).project(camera);
    if (pv.z > 1) return null;
    return [(pv.x * 0.5 + 0.5) * size.w, (-pv.y * 0.5 + 0.5) * size.h];
  };

  const setQuality = ({samples, ao, shadow}) => {
    if (samples !== undefined) {
      for (const t of [composer.renderTarget1, composer.renderTarget2]) {
        if (t) {
          t.samples = samples;
          t.dispose();
        }
      }
    }
    if (ao !== undefined && gtao) gtao.enabled = ao;
    if (shadow !== undefined && sun) {
      sun.shadow.mapSize.set(shadow, shadow);
      sun.shadow.map?.dispose();
      sun.shadow.map = null;
    }
  };

  return {
    renderer,
    scene,
    camera,
    press,
    composer,
    gtao,
    sun,
    bloomPass,
    resize,
    frame,
    project,
    size,
    FLOOR_Y,
    CAMS,
    setQuality,
  };
}
