// Heidelberg GTO 52 print unit live interactive experience.
// Real-time animation, console overlay, orbit/zoom controls, keyboard shortcuts,
// auto tour with operator cursor, reduced motion test shim, and deterministic capture hooks.
import {CAMS, createPressStage} from './stage.js';
import {createConsole, SUBSYSTEMS, CAMS_LIST} from './console.js';
import {
  DURATION,
  SPEED_SPH,
  thAt,
  beatAt,
  camAt,
  makeCursor,
  easeCubicBezier,
} from './film.js';

const W = 1600;
const H = 900;
const IDLE_TIMEOUT = 25; // 25 s idle hands back to tour
const wrapRad = (d) => ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

/**
 * Isolated test shim for prefers-reduced-motion.
 * Honors media query by default, but URL param ?teste ignores it unless ?reduzir is also present.
 * Kept isolated in this single function so it can be cleanly removed for production.
 */
export function testMotionShim() {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const url = new URL(window.location.href);
  const hasTeste = url.searchParams.has('teste');
  const hasReduzir = url.searchParams.has('reduzir');

  if (hasTeste) {
    if (hasReduzir) return query.matches;
    return false;
  }
  return query.matches;
}

export function runLive() {
  const app = document.getElementById('app') || document.body;

  // Canvas element for WebGL rendering
  let canvas = document.getElementById('gl');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'gl';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';
    app.appendChild(canvas);
  }

  const stage = createPressStage({canvas});
  const ui = createConsole(app);
  const tourCursor = makeCursor(ui);

  // ------------------------------------------------------------ Quality TIERS
  const TIERS = [
    {samples: 4, ao: true, shadow: 2048, pr: 1.5},
    {samples: 2, ao: false, shadow: 1024, pr: 1.0},
    {samples: 0, ao: false, shadow: 512, pr: 0.75},
  ];
  const isLight = window.matchMedia('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) < 700;
  // desktop starts at full quality: the 30 fps cap and idle skip removed the heat, and watchPerf drops a tier
  // if the GPU cannot hold 26 fps. Phones / small screens start at the lowest tier.
  let tier = isLight ? 2 : 0;
  let scale = 1;

  const fit = () => {
    scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    app.style.transform = `translate(${(window.innerWidth - W * scale) / 2}px, ${(window.innerHeight - H * scale) / 2}px) scale(${scale})`;
    app.style.transformOrigin = '0 0';
    const pr = Math.min(window.devicePixelRatio || 1, TIERS[tier].pr);
    stage.resize(W, H, pr);
    ui.updateSpots?.();
  };

  const applyTier = () => {
    stage.setQuality?.(TIERS[tier]);
    fit();
  };
  applyTier();
  window.addEventListener('resize', fit);

  // ------------------------------------------------------------ State
  let T = 0;
  let th = 0;
  let sph = SPEED_SPH;
  let paused = false;
  let subsystem = null;
  let camPreset = 'hero';
  let corte = false;
  let setas = false;
  let legendas = false;

  const off = {az: 0, el: 0, d: 1.0};
  const curCam = {...CAMS.hero};

  let ring = {t: -9, x: 0, y: 0};
  const pulse = (x, y) => {
    ring = {t: T, x, y};
  };

  // ------------------------------------------------------------ Auto Tour & Takeover
  const AP = {on: true, t0: 0};
  let lastInput = 0;

  const startTour = () => {
    AP.on = true;
    AP.t0 = T;
    off.az = 0;
    off.el = 0;
    off.d = 1.0;
    if (ui.btn?.tourChip) {
      ui.btn.tourChip.classList.add('on');
      const span = ui.btn.tourChip.querySelector('span');
      if (span) span.textContent = 'Tour automático · clique para assumir';
    }
  };

  const takeOver = () => {
    lastInput = T;
    if (!AP.on) return;
    AP.on = false;
    if (ui.btn?.tourChip) {
      ui.btn.tourChip.classList.remove('on');
      const span = ui.btn.tourChip.querySelector('span');
      if (span) span.textContent = '▶ Retomar tour';
    }
  };

  // Check reduced motion test shim
  const isReducedMotion = testMotionShim();
  if (isReducedMotion) {
    paused = true;
    AP.on = false;
    if (ui.btn?.tourChip) {
      ui.btn.tourChip.classList.remove('on');
      const span = ui.btn.tourChip.querySelector('span');
      if (span) span.textContent = '▶ Retomar tour';
    }
  }

  // ------------------------------------------------------------ Interaction handlers
  const setSubsystem = (subId) => {
    if (subsystem === subId) {
      subsystem = null;
      stage.press.setGhost(null);
    } else {
      subsystem = subId;
      stage.press.setGhost(subId);
      const subDef = SUBSYSTEMS.find((s) => s.id === subId);
      if (subDef?.cam) {
        camPreset = subDef.cam;
        off.az = 0;
        off.el = 0;
        off.d = 1.0;
      }
    }
    takeOver();
  };

  // Subsystem buttons click
  for (const sub of SUBSYSTEMS) {
    const b = ui.btnSub?.[sub.id];
    if (b) {
      b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        setSubsystem(sub.id);
        if (ui.spots[sub.id]) pulse(...ui.spots[sub.id]);
      });
    }
  }

  // Camera preset buttons click
  for (const c of CAMS_LIST) {
    const b = ui.btnCam?.[c.id];
    if (b) {
      b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        camPreset = c.id;
        off.az = 0;
        off.el = 0;
        off.d = 1.0;
        takeOver();
        const pt = ui.spots['cam_' + c.id] || ui.spots[c.id];
        if (pt) pulse(...pt);
      });
    }
  }

  // Toggle buttons click
  if (ui.btnToggle?.corte) {
    ui.btnToggle.corte.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      corte = !corte;
      takeOver();
      if (ui.spots.corte) pulse(...ui.spots.corte);
    });
  }
  if (ui.btnToggle?.setas) {
    ui.btnToggle.setas.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      setas = !setas;
      takeOver();
      if (ui.spots.setas) pulse(...ui.spots.setas);
    });
  }
  if (ui.btnToggle?.legendas) {
    ui.btnToggle.legendas.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      legendas = !legendas;
      takeOver();
      if (ui.spots.legendas) pulse(...ui.spots.legendas);
    });
  }

  // Pause button click
  if (ui.btn.pause) {
    ui.btn.pause.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      paused = !paused;
      takeOver();
      if (ui.spots.pause) pulse(...ui.spots.pause);
    });
  }

  // Speed slider input
  if (ui.sliderSpeed) {
    ui.sliderSpeed.addEventListener('input', (e) => {
      e.stopPropagation();
      sph = Number(ui.sliderSpeed.value);
      takeOver();
    });
    ui.sliderSpeed.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  // Tour Chip click
  if (ui.btn.tourChip) {
    ui.btn.tourChip.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (AP.on) {
        takeOver();
      } else {
        startTour();
      }
    });
  }

  // Orbit drag & Zoom on canvas
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
    canvas.style.cursor = 'grabbing';
    takeOver();
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    off.az += dx * 0.005;
    off.el = Math.max(-0.25, Math.min(1.25, off.el - dy * 0.005));
    takeOver();
  });

  const endDrag = () => {
    if (dragging) {
      dragging = false;
      canvas.style.cursor = 'grab';
    }
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  window.addEventListener('wheel', (e) => {
    off.d = Math.max(0.45, Math.min(2.5, off.d * (1 + e.deltaY * 0.001)));
    takeOver();
  }, {passive: true});

  // Global keyboard shortcuts: 1-6 subsystems, Esc clears, Space pause
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.key >= '1' && e.key <= '6') {
      const idx = Number(e.key) - 1;
      if (SUBSYSTEMS[idx]) {
        setSubsystem(SUBSYSTEMS[idx].id);
      }
    } else if (e.key === 'Escape') {
      subsystem = null;
      stage.press.setGhost(null);
      takeOver();
    } else if (e.code === 'Space') {
      e.preventDefault();
      paused = !paused;
      takeOver();
    }
  });

  // Any general pointerdown on document hands over
  window.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.tourchip')) {
      takeOver();
    }
  });

  // ------------------------------------------------------------ Pure Seek for Captures
  window.seek = (t) => {
    const cyc = ((t % DURATION) + DURATION) % DURATION;
    const seekTh = thAt(t);
    const {beat} = beatAt(cyc);
    const cam = camAt(cyc);
    const cursor = tourCursor(cyc);

    stage.frame(seekTh, cam, {
      hideFrontFrame: beat.corte,
      ghost: beat.ghost,
    });

    ui.update({
      th: seekTh,
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
  };

  window.DURATION = DURATION;
  window.FPS = 60;
  window.SIM = {
    ready: true,
    duration: DURATION,
    fps: 60,
    render: (t) => window.seek(t),
  };

  // If in capture mode, render initial frame and let window.seek take over
  const isCapture = typeof window.__CAPTURE !== 'undefined' || window.location.search.includes('render');
  if (isCapture) {
    window.seek(0);
    window.SIM_SHOWN = true;
    window.dispatchEvent(new Event('simframe'));
    return;
  }

  // ------------------------------------------------------------ Animation Loop (Real-Time)
  let lastTime = performance.now();
  // Budget: 30 fps cap (the press turns slowly, 60 adds heat, not reading); skip drawing when nothing moves
  // (paused, no tour, camera settled) or when the canvas is off screen; drop a quality tier if the GPU
  // cannot hold the cap.
  const FRAME_MS = 1000 / 30;
  let onScreen = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; }).observe(canvas);
  }
  const perf = {t0: 0, n: 0, ms: 0};
  const watchPerf = (now, dtMs) => {
    if (tier >= TIERS.length - 1) return;
    if (!perf.t0) perf.t0 = now + 1000; // ignore the first second (shader warm-up)
    if (now < perf.t0) return;
    perf.n++;
    perf.ms += dtMs;
    if (now - perf.t0 > 2500) {
      if (perf.ms / perf.n > 1000 / 26) {
        tier++;
        applyTier();
      }
      perf.t0 = now + 1000;
      perf.n = 0;
      perf.ms = 0;
    }
  };

  const loop = (now) => {
    requestAnimationFrame(loop);
    const elapsed = now - lastTime;
    if (elapsed < FRAME_MS - 2) return;
    if (!onScreen) {
      lastTime = now;
      return;
    }
    const dt = Math.min(0.1, elapsed / 1000);
    lastTime = now;
    T += dt;
    if (paused && !AP.on && T - lastInput > 1.0 && T - ring.t > 1.0) return;
    watchPerf(now, elapsed);

    let cursor;
    let targetCam;
    let activeGhost;
    let activeCorte;
    let activeSetas;
    let activeLegendas;
    let activeCamName;

    if (AP.on) {
      const tourT = T - AP.t0;
      const cyc = ((tourT % DURATION) + DURATION) % DURATION;
      const {beat} = beatAt(cyc);
      targetCam = camAt(cyc);
      cursor = tourCursor(cyc);

      activeGhost = beat.ghost;
      activeCorte = beat.corte;
      activeSetas = beat.setas;
      activeLegendas = beat.legendas;
      activeCamName = beat.cam;

      // In auto tour, camera passes through directly
      Object.assign(curCam, targetCam);
    } else {
      // Idle check: 25s idle hands back to tour
      if (T - lastInput > IDLE_TIMEOUT) {
        startTour();
      }

      const preset = CAMS[camPreset] || CAMS.hero;
      targetCam = {
        tx: preset.tx,
        ty: preset.ty,
        tz: preset.tz,
        az: preset.az + off.az,
        el: Math.max(-0.25, Math.min(1.25, preset.el + off.el)),
        d: preset.d * off.d,
        hideFrontFrame: corte,
      };

      // Smooth camera interpolation towards target
      const k = 1 - Math.exp(-dt / 0.22);
      curCam.az += wrapRad(targetCam.az - curCam.az) * k;
      curCam.el += (targetCam.el - curCam.el) * k;
      curCam.d += (targetCam.d - curCam.d) * k;
      curCam.tx += (targetCam.tx - curCam.tx) * k;
      curCam.ty += (targetCam.ty - curCam.ty) * k;
      curCam.tz += (targetCam.tz - curCam.tz) * k;
      curCam.hideFrontFrame = corte;

      activeGhost = subsystem;
      activeCorte = corte;
      activeSetas = setas;
      activeLegendas = legendas;
      activeCamName = camPreset;

      const ringK = Math.max(0, 1 - (T - ring.t) / 0.55);
      cursor = {
        x: -99,
        y: -99,
        press: false,
        ring: ringK,
        ringX: ring.x,
        ringY: ring.y,
      };
    }

    // Integrate rotation if not paused
    if (!paused) {
      th += (sph / 3600) * 360 * dt;
    }

    // Render 3D stage
    stage.frame(th, curCam, {
      hideFrontFrame: activeCorte,
      ghost: activeGhost,
    });

    // Update console UI
    ui.update({
      th,
      sph,
      cam: activeCamName,
      corte: activeCorte,
      setas: activeSetas,
      legendas: activeLegendas,
      subsystem: activeGhost,
      paused,
      project: stage.project,
      cursor,
    });

    if (!window.SIM_SHOWN) {
      window.SIM_SHOWN = true;
      window.dispatchEvent(new Event('simframe'));
    }
  };

  requestAnimationFrame(loop);
}
