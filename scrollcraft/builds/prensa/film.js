// Heidelberg GTO 52 print unit film script and deterministic pure render(t).
// SPEC §8 42-second loop at 6000 sph with cubic-bezier(0.65, 0, 0.35, 1) transitions.
import {CAMS, createPressStage} from './stage.js';
import {createConsole} from './console.js';

export const DURATION = 42;
export const SPEED_SPH = 6000;
const D2R = Math.PI / 180;

// SCRIPT from SPEC §8 (42 s loop)
export const SCRIPT = [
  {t: 0, cam: 'hero', ghost: null, corte: false, setas: false, legendas: false, btn: 'hero'},
  {t: 4, cam: 'lado', ghost: null, corte: true, setas: true, legendas: false, btn: 'corte'},
  {t: 9, cam: 'molha', ghost: 'molha', corte: true, setas: false, legendas: false, btn: 'molha'},
  {t: 15, cam: 'tinta', ghost: 'tinta', corte: true, setas: false, legendas: false, btn: 'tinta'},
  {t: 22, cam: 'cilindros', ghost: 'chapa', corte: true, setas: false, legendas: false, btn: 'chapa'},
  {t: 27, cam: 'cilindros', ghost: 'blanqueta', corte: true, setas: false, legendas: false, btn: 'blanqueta'},
  {t: 32, cam: 'folha', ghost: 'folha', corte: true, setas: false, legendas: false, btn: 'folha'},
  {t: 38, cam: 'hero', ghost: null, corte: false, setas: false, legendas: true, btn: 'hero'},
  {t: 42, cam: 'hero', ghost: null, corte: false, setas: false, legendas: false, btn: 'hero'},
];

// Closed-form angle integration: 6000 sheets/h = 100 rpm = 600 deg/s
export const thAt = (t) => ((SPEED_SPH / 3600) * 360 * t);

// Cubic-bezier(0.65, 0, 0.35, 1) solver
export function easeCubicBezier(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let u0 = 0, u1 = 1, u = x;
  for (let i = 0; i < 10; i++) {
    const xu = 3 * (1 - u) * (1 - u) * u * 0.65 + 3 * (1 - u) * u * u * 0.35 + u * u * u;
    if (Math.abs(xu - x) < 1e-6) break;
    if (xu < x) u0 = u; else u1 = u;
    u = 0.5 * (u0 + u1);
  }
  return 3 * (1 - u) * u * u + u * u * u;
}

const wrapRad = (d) => ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

export function beatAt(t) {
  const cyc = ((t % DURATION) + DURATION) % DURATION;
  let idx = 0;
  for (let i = 0; i < SCRIPT.length - 1; i++) {
    if (cyc >= SCRIPT[i].t) {
      idx = i;
    }
  }
  return {beat: SCRIPT[idx], nextBeat: SCRIPT[idx + 1] || SCRIPT[idx], index: idx, cyc};
}

// Camera interpolated between views
export function camAt(t) {
  const {beat, nextBeat, index, cyc} = beatAt(t);
  const camCur = CAMS[beat.cam] || CAMS.hero;

  // If at the start or cam doesn't change, return target directly
  if (index === 0 && cyc < SCRIPT[0].t + 0.1) return {...camCur};

  const t0 = beat.t;
  const t1 = nextBeat.t;
  const transDur = Math.min(1.8, (t1 - t0) * 0.45);

  const prevBeat = index > 0 ? SCRIPT[index - 1] : beat;
  const camPrev = CAMS[prevBeat.cam] || CAMS.hero;

  if (cyc < t0 + transDur && prevBeat.cam !== beat.cam) {
    const u = (cyc - t0) / transDur;
    const k = easeCubicBezier(u);

    const azDiff = wrapRad(camCur.az - camPrev.az);
    const swing = Math.min(1, Math.abs(azDiff) / (Math.PI / 2));
    const distBump = Math.sin(Math.PI * k) * (0.2 * swing);

    return {
      tx: camPrev.tx + (camCur.tx - camPrev.tx) * k,
      ty: camPrev.ty + (camCur.ty - camPrev.ty) * k,
      tz: camPrev.tz + (camCur.tz - camPrev.tz) * k,
      az: camPrev.az + azDiff * k,
      el: camPrev.el + (camCur.el - camPrev.el) * k,
      d: camPrev.d + (camCur.d - camPrev.d) * k + distBump,
      hideFrontFrame: beat.corte,
    };
  }

  return {...camCur, hideFrontFrame: beat.corte};
}

// Operator cursor trajectory
export function makeCursor(ui) {
  const REST = [800, 520];

  const getSpot = (btnId) => {
    if (ui?.spots?.[btnId]) return ui.spots[btnId];
    // Sensible defaults in 1600x900 space if not yet measured
    const DEFAULTS = {
      hero: [1120, 68],
      lado: [1205, 68],
      tinta_view: [1295, 68],
      molha_view: [1385, 68],
      folha_view: [1475, 68],
      corte: [1160, 126],
      setas: [1310, 126],
      legendas: [1460, 126],
      tinta: [470, 830],
      molha: [630, 830],
      chapa: [790, 830],
      blanqueta: [950, 830],
      impressao: [1110, 830],
      folha: [1270, 830],
    };
    return DEFAULTS[btnId] || REST;
  };

  return (t) => {
    const cyc = ((t % DURATION) + DURATION) % DURATION;

    // Find if we are near any beat trigger (within -1.2s to +1.2s)
    for (let i = 1; i < SCRIPT.length - 1; i++) {
      const beat = SCRIPT[i];
      const tEv = beat.t;
      const target = getSpot(beat.btn);

      if (cyc >= tEv - 1.2 && cyc <= tEv + 1.2) {
        if (cyc < tEv) {
          // Approach
          const u = (cyc - (tEv - 1.2)) / 1.2;
          const k = easeCubicBezier(u);
          return {
            x: REST[0] + (target[0] - REST[0]) * k,
            y: REST[1] + (target[1] - REST[1]) * k,
            press: false,
            ring: 0,
            ringX: target[0],
            ringY: target[1],
          };
        } else if (cyc < tEv + 0.3) {
          // Press & Ring
          const u = (cyc - tEv) / 0.3;
          return {
            x: target[0],
            y: target[1],
            press: true,
            ring: 1 - u,
            ringX: target[0],
            ringY: target[1],
          };
        } else {
          // Return to rest
          const u = (cyc - (tEv + 0.3)) / 0.9;
          const k = easeCubicBezier(u);
          return {
            x: target[0] + (REST[0] - target[0]) * k,
            y: target[1] + (REST[1] - target[1]) * k,
            press: false,
            ring: 0,
            ringX: target[0],
            ringY: target[1],
          };
        }
      }
    }

    // Default resting position
    return {
      x: REST[0],
      y: REST[1],
      press: false,
      ring: 0,
      ringX: REST[0],
      ringY: REST[1],
    };
  };
}

export function makeFilm() {
  return async ({canvas, capture}) => {
    const stage = createPressStage({canvas});
    const resize = () => stage.resize(1600, 900, capture ? (devicePixelRatio || 1) : Math.min(devicePixelRatio || 1, 2));
    resize();

    const app = document.getElementById('app');
    const ui = createConsole(app);
    const cursorAt = makeCursor(ui);

    return {
      resize,
      render(t) {
        const cyc = ((t % DURATION) + DURATION) % DURATION;
        const th = thAt(t);
        const {beat} = beatAt(cyc);
        const cam = camAt(cyc);
        const cursor = cursorAt(cyc);

        stage.frame(th, cam, {
          hideFrontFrame: beat.corte,
          ghost: beat.ghost,
        });

        ui.update({
          th,
          sph: SPEED_SPH,
          cam: beat.cam,
          corte: beat.corte,
          setas: beat.setas,
          legendas: beat.legendas,
          subsystem: beat.ghost,
          paused: false,
          project: stage.project,
          cursor,
        });

        return {};
      },
    };
  };
}
