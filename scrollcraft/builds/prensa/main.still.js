// Heidelberg GTO 52 print unit simulator harness.
// Pure function of time t: 6000 sheets/h (100 rpm = 600 deg/s).
import {runSim} from 'teardown-kit/runtime.js';
import {CAMS, createPressStage} from './stage.js';

export const DEFAULTS = {
  duration: 20,
  fps: 60,
  theme: 'light',
  hud: {enabled: false},
  director: {enabled: false},
  watermark: '',
};

runSim(DEFAULTS, async ({canvas, capture}) => {
  const stage = createPressStage({canvas});
  const resize = () => stage.resize(1600, 900, capture ? (devicePixelRatio || 1) : Math.min(devicePixelRatio || 1, 2));
  resize();

  const q = new URLSearchParams(window.location.search);
  const cfg = window.__SIM_CONFIG || {};
  const camName = q.get('cam') || cfg.cam || 'hero';
  const camPreset = CAMS[camName] || CAMS.hero;
  const ghostParam = q.get('ghost') || cfg.ghost || null;
  const thOverride = q.has('th') ? Number(q.get('th')) : cfg.th !== undefined ? Number(cfg.th) : null;

  if (ghostParam) {
    stage.press.setGhost(ghostParam);
  }

  // Pure render(t) function: no Math.random, no Date, no mutable state carried across frames
  const render = (t) => {
    const th = thOverride !== null ? thOverride : t * 360 * (6000 / 3600);
    stage.frame(th, camPreset);
    return {};
  };

  // Capture / still hooks
  window.seek = (t) => render(t);
  window.DURATION = DEFAULTS.duration;
  window.FPS = DEFAULTS.fps;

  return {
    resize,
    render,
  };
});
