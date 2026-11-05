// Heidelberg GTO 52 site embedded component.
// Pure scroll-driven camera & final sheet takeover with time-integrated mechanics.
import * as THREE from 'three';
import {createPressStage, CAMS, BG} from '../prensa/stage.js';
import {easeCubicBezier} from '../prensa/film.js';
import {P} from '../prensa/kin.js';

const D2R = Math.PI / 180;
const wrapRad = (d) => ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

function solveCubicBezier(p1x, p1y, p2x, p2y) {
  return function (x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u0 = 0, u1 = 1, u = x;
    for (let i = 0; i < 14; i++) {
      const xu = 3 * (1 - u) * (1 - u) * u * p1x + 3 * (1 - u) * u * u * p2x + u * u * u;
      if (Math.abs(xu - x) < 1e-6) break;
      if (xu < x) u0 = u; else u1 = u;
      u = 0.5 * (u0 + u1);
    }
    return 3 * (1 - u) * (1 - u) * u * p1y + 3 * (1 - u) * u * u * p2y + u * u * u;
  };
}

const easeOutSheet = solveCubicBezier(0.16, 1, 0.3, 1);

// Scroll budget shared with js/prensa-embed.js (keep both in step): the tour ends at FLY0, the printed sheet flies to
// the hand-off rectangle by FLY1, then the parent page lands it on the bench and plays the fold.
export const FLY0 = 0.66;
export const FLY1 = 0.72;
// the job: the bag's flat sheet (rectified from the fold clip's first frame), printed at 520 mm wide
export const ART = {src: 'folha-sacola.webp', aspect: 2048 / 890};
/** the hand-off rectangle in CSS px; js/prensa-embed.js computes the same one */
export const handoffRect = (W, H) => {
  const w = Math.min(W * 0.62, H * 0.62 * ART.aspect);
  const h = w / ART.aspect;
  return {x: (W - w) / 2, y: H * 0.5 - h / 2, w, h};
};

const K = FLY0 / 0.84;
const FAIXAS = [
  { p0: 0.00, p1: 0.10, cam: 'hero', ghost: null, corte: false },
  { p0: 0.10, p1: 0.24, cam: 'lado', ghost: null, corte: true },
  { p0: 0.24, p1: 0.38, cam: 'molha', ghost: 'molha', corte: true },
  { p0: 0.38, p1: 0.52, cam: 'tinta', ghost: 'tinta', corte: true },
  { p0: 0.52, p1: 0.62, cam: 'cilindros', ghost: 'chapa', corte: true },
  { p0: 0.62, p1: 0.72, cam: 'cilindros', ghost: 'blanqueta', corte: true },
  { p0: 0.72, p1: 0.84, cam: 'folha', ghost: 'folha', corte: true },
  { p0: 0.84, p1: 1 / K, cam: 'folha', ghost: null, corte: true },
].map((f) => ({...f, p0: f.p0 * K, p1: f.p1 * K}));

const loadImage = (src) =>
  new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

export async function runSite() {
  const art = await loadImage(ART.src);
  // the job's sheet: full 520 mm width, length from the artwork (a valid GTO 52 format, min 105 x 180)
  P.sheetLength = Math.round(P.sheetWidth / ART.aspect);
  const app = document.getElementById('app') || document.body;

  let canvas = document.getElementById('gl');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'gl';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    app.appendChild(canvas);
  }

  const stage = createPressStage({canvas, look: {press: {art}}});

  // Quality TIERS
  const TIERS = [
    // a lower tier sheds effects first and keeps the canvas at (near) native resolution: dropping the pixel
    // ratio below 1 is what made the press look blurred
    { samples: 4, ao: true, shadow: 2048, pr: 1.5 },
    { samples: 4, ao: false, shadow: 1024, pr: 1.25 },
    { samples: 2, ao: false, shadow: 1024, pr: 1.0 },
  ];
  const isLight = window.matchMedia('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) < 700;
  let tier = isLight ? 2 : 0;

  const fit = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxPr = isLight ? 1.5 : 2.0;
    const pr = Math.max(1, Math.min(window.devicePixelRatio || 1, TIERS[tier].pr, maxPr));
    stage.resize(w, h, pr);
  };

  const applyTier = () => {
    console.info(`[prensa] qualidade: nível ${tier}`, TIERS[tier]);
    stage.setQuality?.(TIERS[tier]);
    fit();
  };
  applyTier();
  window.addEventListener('resize', fit);

  // ------------------------------------------------------------ Final Sheet Mesh
  const sheetW = P.sheetWidth * 0.001; // 0.520 m
  const sheetL = P.sheetLength * 0.001; // 0.360 m
  const finalSheetGeo = new THREE.PlaneGeometry(sheetW, sheetL, 16, 16);

  // Grab printed texture from the kin sheet in press.js
  // first mesh in the folha group that carries a texture (children[0] is the untextured infeed table)
  let sheetTex = null;
  stage.press.parts.folha.traverse((o) => {
    if (!sheetTex && o.isMesh && o.material?.map) sheetTex = o.material.map;
  });

  const themeColors = {
    bg: '#F3EFE6',
    ink: '#121417',
    accent: '#D41924',
  };

  const artTex = new THREE.Texture(art);
  artTex.colorSpace = THREE.SRGBColorSpace;
  artTex.anisotropy = 8;
  artTex.needsUpdate = true;
  const finalSheetMat = new THREE.MeshBasicMaterial({map: artTex, side: THREE.DoubleSide, toneMapped: false});

  // drawn last and over everything: it sits between the camera and the ghosted press, which must not show through
  finalSheetMat.depthTest = false;
  finalSheetMat.depthWrite = false;
  const finalSheetMesh = new THREE.Mesh(finalSheetGeo, finalSheetMat);
  finalSheetMesh.renderOrder = 999;
  finalSheetMesh.name = 'finalSheet';
  finalSheetMesh.visible = false;
  stage.scene.add(finalSheetMesh);

  // Initial kinematic exit pose
  const exitAngleRad = (P.infeedAngleDeg + P.wrapDeg) * D2R; // 117 deg
  const pOut = [P.cylR * Math.cos(exitAngleRad), P.cylR * Math.sin(exitAngleRad)];
  const tOut = [-Math.sin(exitAngleRad), Math.cos(exitAngleRad)];
  const nOut = [-tOut[1], tOut[0]];

  const pos0 = new THREE.Vector3(
    (pOut[0] + 0.5 * P.sheetLength * tOut[0]) * 0.001,
    (pOut[1] + 0.5 * P.sheetLength * tOut[1]) * 0.001,
    0
  );

  const rotMat0 = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(tOut[0], tOut[1], 0),
    new THREE.Vector3(nOut[0], nOut[1], 0)
  );
  const quat0 = new THREE.Quaternion().setFromRotationMatrix(rotMat0);


  // The studio backdrop follows the page theme: the stage's light gradient as built, or the same kind of
  // gradient around the page's dark background (lighter at the top, the page colour at the bottom).
  const lightBackdrop = stage.scene.background;
  let darkBackdrop = null;
  function backdropFor(bg) {
    const base = new THREE.Color(bg);
    const hsl = {};
    base.getHSL(hsl);
    if (hsl.l >= 0.5) return lightBackdrop;
    if (darkBackdrop && darkBackdrop.userData.bg === bg) return darkBackdrop;
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 512;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#' + base.clone().lerp(new THREE.Color('#ffffff'), 0.07).getHexString());
    gr.addColorStop(0.55, '#' + base.clone().lerp(new THREE.Color('#ffffff'), 0.03).getHexString());
    gr.addColorStop(1, '#' + base.getHexString());
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 512);
    if (darkBackdrop) darkBackdrop.dispose();
    darkBackdrop = new THREE.CanvasTexture(c);
    darkBackdrop.colorSpace = THREE.SRGBColorSpace;
    darkBackdrop.userData.bg = bg;
    return darkBackdrop;
  }

  function updateTheme(colors) {
    if (colors.bg) {
      themeColors.bg = colors.bg;
    }
    if (colors.ink) themeColors.ink = colors.ink;
    if (colors.accent) themeColors.accent = colors.accent;
  }

  // ------------------------------------------------------------ Frame Rendering
  function renderFrame(p, currentTh) {
    // re-asserted every frame (cached, so cheap): a theme that arrives during start-up must not be lost
    stage.scene.background = backdropFor(themeColors.bg);
    // Determine active faixa
    let idx = 0;
    for (let i = 0; i < FAIXAS.length; i++) {
      if (p >= FAIXAS[i].p0) idx = i;
    }
    const faixa = FAIXAS[idx];
    const prevFaixa = idx > 0 ? FAIXAS[idx - 1] : FAIXAS[0];
    const p0 = faixa.p0;
    const p1 = faixa.p1;
    const transLen = (p1 - p0) * 0.30;

    // Interpolate camera
    const camCur = CAMS[faixa.cam] || CAMS.hero;
    const camPrev = CAMS[prevFaixa.cam] || CAMS.hero;
    let cam;
    if (p < p0 + transLen && idx > 0 && prevFaixa.cam !== faixa.cam) {
      const u = (p - p0) / transLen;
      const k = easeCubicBezier(u);
      const azDiff = wrapRad(camCur.az - camPrev.az);
      const swing = Math.min(1, Math.abs(azDiff) / (Math.PI / 2));
      const distBump = Math.sin(Math.PI * k) * (0.2 * swing);
      cam = {
        tx: camPrev.tx + (camCur.tx - camPrev.tx) * k,
        ty: camPrev.ty + (camCur.ty - camPrev.ty) * k,
        tz: camPrev.tz + (camCur.tz - camPrev.tz) * k,
        az: camPrev.az + azDiff * k,
        el: camPrev.el + (camCur.el - camPrev.el) * k,
        d: camPrev.d + (camCur.d - camPrev.d) * k + distBump,
        hideFrontFrame: faixa.corte,
      };
    } else {
      cam = {...camCur, hideFrontFrame: faixa.corte};
    }

    // Mobile portrait camera distance adjustment (x1.25)
    // while the section title is on screen (it fades out by p ~ 0.13) the press makes room for it:
    // landscape pushes it right (aim left of it), portrait pushes it down (aim above it)
    const titleOn = 1 - Math.max(0, Math.min(1, (p - 0.06) / 0.08));
    if (window.innerHeight > window.innerWidth) {
      cam.d *= 1.25;
      cam.ty += 0.12 * titleOn;
    } else {
      cam.tx -= 0.24 * titleOn;
    }

    // Ghosting isolation
    stage.press.setGhost(p < FLY0 ? faixa.ghost : null);

    // After the hand-off the parent page owns the picture: draw only the background (cheap, and nothing to see)
    if (p >= FLY1 + 0.03) {
      stage.renderer.setRenderTarget(null);
      stage.renderer.setClearColor(new THREE.Color(themeColors.bg), 1.0);
      stage.renderer.clear();
      return;
    }

    // GTAO reads the scene depth, which the final sheet does not write: off for the whole sheet phase
    if (stage.gtao) stage.gtao.enabled = TIERS[tier].ao && p < FLY0;
    stage.bloomPass.enabled = p < FLY0;

    if (p < FLY0) {
      finalSheetMesh.visible = false;
    } else {
      finalSheetMesh.visible = true;
      const cosEl = Math.cos(cam.el);
      const camPos = new THREE.Vector3(
        cam.tx + cam.d * cosEl * Math.sin(cam.az),
        cam.ty + cam.d * Math.sin(cam.el),
        cam.tz + cam.d * cosEl * Math.cos(cam.az)
      );
      stage.camera.position.copy(camPos);
      stage.camera.lookAt(cam.tx, cam.ty, cam.tz);
      stage.camera.updateMatrixWorld();

      // pose that fills the hand-off rectangle exactly: a plane facing the camera at distance `dist`
      const W = window.innerWidth;
      const H = window.innerHeight;
      const R = handoffRect(W, H);
      const dist = 0.6;
      const viewH = 2 * dist * Math.tan((stage.camera.fov * Math.PI) / 360);
      const mPerPx = viewH / H;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(stage.camera.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(stage.camera.quaternion);
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(stage.camera.quaternion);
      const posEnd = camPos
        .clone()
        .addScaledVector(fwd, dist)
        .addScaledVector(right, (R.x + R.w / 2 - W / 2) * mPerPx)
        .addScaledVector(up, (H / 2 - (R.y + R.h / 2)) * mPerPx);
      const scaleEnd = (R.w * mPerPx) / sheetW;

      const k = easeOutSheet(Math.min(1, (p - FLY0) / (FLY1 - FLY0)));
      finalSheetMesh.position.lerpVectors(pos0, posEnd, k);
      finalSheetMesh.quaternion.slerpQuaternions(quat0, stage.camera.quaternion, k);
      const sc = 1 + (scaleEnd - 1) * k;
      finalSheetMesh.scale.set(sc, sc, 1);
    }

    // Render 3D frame
    stage.frame(currentTh, cam, {
      // on the site the operator-side glass frame stays hidden: its 14% grey film hazed the whole press
      hideFrontFrame: true,
      ghost: faixa.ghost,
      restoreMaterials: !faixa.ghost,
    });
  }

  // ------------------------------------------------------------ Performance Monitor (watchPerf)
  let frameCount = 0;
  let perfWindowStart = performance.now();
  let perfCooldownUntil = 0;

  // Measures only the gaps between consecutive draws: pauses (off screen, hidden tab, nothing moving)
  // are not slowness. The poster fallback needs 3 bad windows in a row at the lowest tier, so one hitch
  // (a tab switch, a scroll jank) never takes the 3D away for good.
  let lastPerfDraw = 0;
  let perfMs = 0;
  let badWindows = 0;
  function watchPerf(now) {
    const gap = lastPerfDraw ? now - lastPerfDraw : 0;
    lastPerfDraw = now;
    if (now < perfCooldownUntil || gap === 0 || gap > 250) return;
    frameCount++;
    perfMs += gap;
    if (frameCount >= 30) {
      const fps = (frameCount * 1000) / perfMs;
      frameCount = 0;
      perfMs = 0;
      if (fps >= 26) {
        badWindows = 0;
        return;
      }
      if (tier < TIERS.length - 1) {
        tier++;
        applyTier();
        perfCooldownUntil = now + 1500;
        badWindows = 0;
      } else if (fps < 20 && ++badWindows >= 3) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({type: 'prensa:fallback'}, '*');
        }
      }
    }
  }

  // ------------------------------------------------------------ Main Loop (30 fps cap)
  const FPS_CAP = 30;
  const FRAME_MIN_MS = 1000 / FPS_CAP;
  let lastDrawTime = 0;
  let lastTime = 0;
  let isVisible = true;
  let targetP = 0;
  let lastProgressAt = 0;
  let curP = 0;
  let th = 0;
  let readySent = false;
  // capture clock: set by the parent's frame-by-frame recorder ({type:'prensa:clock', t}); never sent on the
  // live site, where the press turns in real time
  let clockT = null;

  function tick(now) {
    requestAnimationFrame(tick);
    if (!isVisible || clockT !== null) return; // No draw when not visible (or when the recorder drives frames)

    // 60 fps while the block is being scrolled (motion the eye follows), 30 when only the press turns
    const elapsed = now - lastDrawTime;
    const moving = now - lastProgressAt < 300;
    if (elapsed < (moving ? 1000 / 60 : FRAME_MIN_MS) - 2) return;

    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0.033;
    lastTime = now;
    lastDrawTime = now;

    // Time-based continuous machine rotation (6000 sph = 600 deg/s)
    th += 600 * dt;
    curP = targetP;

    renderFrame(curP, th);
    watchPerf(now);

    if (!readySent) {
      readySent = true;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({type: 'prensa:ready'}, '*');
      }
    }
  }

  requestAnimationFrame((now) => {
    lastTime = now;
    lastDrawTime = now;
    tick(now);
  });

  // ------------------------------------------------------------ PostMessage Protocol
  window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;
    const {type} = event.data;
    if (type === 'prensa:progress') {
      if (typeof event.data.p === 'number') {
        const np = Math.max(0, Math.min(1, event.data.p));
        if (np !== targetP) lastProgressAt = performance.now();
        targetP = np;
      }
    } else if (type === 'prensa:clock') {
      // recorder: draw exactly this (p, t) now and say so
      clockT = event.data.t;
      if (typeof event.data.p === 'number') targetP = Math.max(0, Math.min(1, event.data.p));
      renderFrame(targetP, 600 * clockT);
      window.parent.postMessage({type: 'prensa:drawn', id: event.data.id}, '*');
    } else if (type === 'prensa:theme') {
      updateTheme(event.data);
    } else if (type === 'prensa:visible') {
      isVisible = !!event.data.on;
      if (isVisible) {
        lastTime = performance.now();
        lastDrawTime = performance.now();
      }
    }
  });

  // ------------------------------------------------------------ Capture / Still Hooks
  window.seek = (t) => {
    const seekTh = t * 600;
    renderFrame(targetP, seekTh);
  };
  window.DURATION = 10;
  window.FPS = 30;
  window.SIM = {
    ready: true,
    render: (t) => window.seek(t),
    duration: 10,
    fps: 30,
  };
}
