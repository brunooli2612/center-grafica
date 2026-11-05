// Prensa Offset Embed Script — Controller for #como-fazemos sticky rail
(function () {
  'use strict';

  const section = document.getElementById('como-fazemos');
  if (!section) return;

  const header = section.querySelector('.prensa-header');
  const iframe = section.querySelector('.prensa-iframe');
  const poster = section.querySelector('.prensa-poster');
  const captionItems = Array.from(section.querySelectorAll('.prensa-caption-item'));

  // 1. Accessibility: reduced motion skips WebGL iframe entirely
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) {
    if (iframe) iframe.remove();
    return;
  }

  // 2. Theme Colors Reader
  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      bg: (style.getPropertyValue('--bg-canvas') || '#F3EFE6').trim(),
      ink: (style.getPropertyValue('--ink-primary') || '#121417').trim(),
      accent: (style.getPropertyValue('--brand-red') || '#D41924').trim(),
    };
  }

  function postToIframe(msg) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(msg, '*');
    } catch {
      // Safe cross-context postMessage
    }
  }

  function sendTheme() {
    postToIframe({
      type: 'prensa:theme',
      ...getThemeColors(),
    });
  }

  function sendVisible(on) {
    postToIframe({
      type: 'prensa:visible',
      on: !!on,
    });
  }

  function sendProgress(p) {
    postToIframe({
      type: 'prensa:progress',
      p,
    });
  }

  // 3. Lazy-loading via IntersectionObserver (1 screen distance)
  let iframeLoaded = false;
  let isSectionVisible = false;

  function loadIframe() {
    if (iframeLoaded || !iframe) return;
    iframeLoaded = true;
    const src = iframe.getAttribute('data-src') || 'assets/prensa/prensa-site.html';
    iframe.src = src;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isSectionVisible = entry.isIntersecting;
        if (isSectionVisible) {
          loadIframe();
          sendVisible(true);
        } else {
          sendVisible(false);
        }
      });
    },
    { rootMargin: '100% 0px' }
  );
  observer.observe(section);

  // 4. Scroll budget, shared with scrollcraft/builds/prensa-site/site.js (keep both in step)
  //    0 .. FLY0   tour of the press (inside the iframe)
  //    FLY0 .. FLY1 the printed sheet flies to the hand-off rectangle (iframe)
  //    FLY1 .. LAND the same sheet, now an <img>, lands on the bench of the fold clip; the iframe fades out and the
  //                 clip's first frame fades in under it during the last part of the flight
  //    LAND .. FOLD the clip, scrubbed by the scroll: the sheet folds into the bag
  //    FOLD .. 1    the bag holds
  const FLY0 = 0.66;
  const FLY1 = 0.72;
  const LAND = 0.8;
  const FOLD = 0.96;
  const ART_ASPECT = 2048 / 890;
  const handoffRect = (W, H) => {
    const w = Math.min(W * 0.62, H * 0.62 * ART_ASPECT);
    const h = w / ART_ASPECT;
    return { x: (W - w) / 2, y: H * 0.5 - h / 2, w, h };
  };
  // Portrait phones get the vertical fold (dobra-m.mp4, 720 x 1280); everything else the 16:9 one.
  const mobileClip = window.matchMedia('(max-width: 860px) and (orientation: portrait)').matches;
  // Where the art's corners (TL, TR, BR, BL of folha-sacola.webp) sit in the clip's first frame, in file px.
  // `turn`: the vertical clip has the sheet lying lengthwise into the depth, a quarter turn from the art, so
  // the landing also turns it (see updateBench).
  const CLIP = mobileClip
    ? { w: 720, h: 1280, quad: [[31, 1090], [153, 481], [579, 485], [700, 1094]], turn: Math.PI / 2 }
    : { w: 1890, h: 1080, quad: [[340, 406], [1749, 502], [1808, 947], [71, 808]], turn: 0 };

  const K = FLY0 / 0.84;
  const RANGES = [
    { min: 0.0, max: 0.1, idx: 0 },
    { min: 0.1, max: 0.24, idx: 1 },
    { min: 0.24, max: 0.38, idx: 2 },
    { min: 0.38, max: 0.52, idx: 3 },
    { min: 0.52, max: 0.62, idx: 4 },
    { min: 0.62, max: 0.72, idx: 5 },
    { min: 0.72, max: 0.88, idx: 6 },
  ].map((r) => ({ ...r, min: r.min * K, max: r.max * K }));
  // the last caption takes over right where the press's last one ends, so the flight never runs captionless
  RANGES.push({ min: RANGES[RANGES.length - 1].max, max: 1.01, idx: 7 });

  let currentCaptionIdx = -1;
  function updateCaptions(p) {
    let targetIdx = -1;
    for (let i = 0; i < RANGES.length; i++) {
      if (p >= RANGES[i].min && p < RANGES[i].max) {
        targetIdx = RANGES[i].idx;
        break;
      }
    }

    if (targetIdx !== currentCaptionIdx) {
      currentCaptionIdx = targetIdx;
      captionItems.forEach((item, index) => {
        if (index === currentCaptionIdx) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });
    }

    // The title introduces the block, then gets out of the machine's way (the captions carry on)
    if (header) {
      const fade = Math.max(0, Math.min(1, 1 - (p - 0.08) / 0.05));
      header.style.opacity = fade.toFixed(3);
    }
  }

  // 5. Landing on the bench and the fold
  const mediaBox = section.querySelector('.prensa-media-container');
  const bench = document.createElement('div');
  bench.className = 'prensa-bench';
  bench.setAttribute('aria-hidden', 'true');
  bench.innerHTML =
    '<video class="prensa-bench__clip" muted playsinline preload="none"></video>' +
    '<img class="prensa-bench__sheet" alt="" src="assets/prensa/folha-sacola.webp" decoding="async">';
  if (mediaBox) mediaBox.appendChild(bench);
  const clip = bench.querySelector('.prensa-bench__clip');
  const sheet = bench.querySelector('.prensa-bench__sheet');
  const SHEET_W = 1000;
  sheet.style.width = SHEET_W + 'px';
  sheet.style.height = SHEET_W / ART_ASPECT + 'px';

  let clipDur = 0;
  let clipTarget = 0;
  let clipSeeking = false;
  let clipLoading = false;
  let clipTries = 0;
  function loadClip() {
    if (clipLoading || clipTries >= 2) return;
    clipLoading = true;
    clipTries++;
    // a blob seeks instantly; the files carry a keyframe every 4-8 frames for smooth scrubbing
    fetch(mobileClip ? 'assets/prensa/dobra-m.mp4' : 'assets/prensa/dobra.mp4')
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.blob();
      })
      .then((b) => {
        clip.src = URL.createObjectURL(b);
        clip.addEventListener('loadeddata', () => { clipDur = clip.duration; seekClip(); }, { once: true });
        clip.addEventListener('seeked', () => { clipSeeking = false; seekClip(); });
      })
      .catch(() => { clipLoading = false; });
  }
  function seekClip() {
    if (!clipDur || clipSeeking) return;
    const t = Math.max(0, Math.min(clipDur - 0.05, clipTarget));
    if (Math.abs(clip.currentTime - t) > 0.02) {
      clipSeeking = true;
      clip.currentTime = t;
    }
  }

  // The clip is laid out by hand: centred, at scale s (file px -> CSS px). It lands small enough that the whole
  // sheet is on screen (a photo on the paper; on a phone that is far below cover, which would show a third of the
  // sheet), then grows to cover the screen while the bag folds.
  const quadXs = CLIP.quad.map(([x]) => x);
  const SHEET_SPAN = Math.max(...quadXs) - Math.min(...quadXs); // widest extent of the sheet in the file
  const clipScales = (W, H) => {
    const cover = Math.max(W / CLIP.w, H / CLIP.h);
    return { land: Math.min(cover, (W * 0.94) / SHEET_SPAN, (H * 0.9) / CLIP.h), cover };
  };
  function clipQuadAt(W, H, s) {
    const ox = (W - CLIP.w * s) / 2;
    const oy = (H - CLIP.h * s) / 2;
    return CLIP.quad.map(([x, y]) => [ox + x * s, oy + y * s]);
  }
  function placeClip(W, H, s, radius) {
    clip.style.width = CLIP.w * s + 'px';
    clip.style.height = CLIP.h * s + 'px';
    clip.style.left = (W - CLIP.w * s) / 2 + 'px';
    clip.style.top = (H - CLIP.h * s) / 2 + 'px';
    clip.style.borderRadius = radius.toFixed(1) + 'px';
  }
  // CSS matrix3d mapping the element box (0,0)-(w,h) onto the quad q (TL, TR, BR, BL)
  function boxToQuad(w, h, q) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den;
    const hh = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
    const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
    // unit square -> quad, then scale the element box down to the unit square
    const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
    return 'matrix3d(' + m.map((v) => +v.toFixed(8)).join(',') + ')';
  }
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const clamp01 = (u) => Math.max(0, Math.min(1, u));

  function updateBench(p) {
    if (p > FLY0 - 0.1) loadClip();
    const W = window.innerWidth;
    const H = window.innerHeight;
    // iframe out right after the hand-off
    if (iframe && iframe.classList.contains('is-ready')) {
      iframe.style.opacity = p < FLY1 ? '' : (1 - clamp01((p - FLY1) / 0.015)).toFixed(3);
    }
    bench.style.visibility = p >= FLY1 ? 'visible' : 'hidden';
    if (p < FLY1) return;
    const S = clipScales(W, H);
    // the sheet: hand-off rectangle -> its place in the clip's first frame, with the clip at its landing scale
    const R = handoffRect(W, H);
    const from = [[R.x, R.y], [R.x + R.w, R.y], [R.x + R.w, R.y + R.h], [R.x, R.y + R.h]];
    const to = clipQuadAt(W, H, S.land);
    const k = ease(clamp01((p - FLY1) / (LAND - FLY1)));
    // a quarter-turn landing spins the rectangle about its centre as it goes, so the corners never cross
    const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
    const t = CLIP.turn * k, cos = Math.cos(t), sin = Math.sin(t);
    const spun = from.map(([x, y]) => [cx + (x - cx) * cos + (y - cy) * sin, cy - (x - cx) * sin + (y - cy) * cos]);
    const q = spun.map(([x, y], i) => [x + (to[i][0] - x) * k, y + (to[i][1] - y) * k]);
    sheet.style.transform = boxToQuad(SHEET_W, SHEET_W / ART_ASPECT, q);
    // Only once the sheet has landed does the bench appear, around it: the <img> is that frame's own sheet, so
    // nothing doubles. Then the <img> hands over to the clip, which grows to cover while the bag folds.
    const IN0 = LAND, IN1 = LAND + 0.012, OUT1 = LAND + 0.02, GROW1 = LAND + 0.09;
    // Plan B: while the clip is not playable (still loading, or it failed), the landed sheet simply stays
    if (!clipDur) {
      clip.style.opacity = '0';
      sheet.style.opacity = '1';
      return;
    }
    clip.style.opacity = clamp01((p - IN0) / (IN1 - IN0)).toFixed(3);
    sheet.style.opacity = (1 - clamp01((p - IN1) / (OUT1 - IN1))).toFixed(3);
    const g = ease(clamp01((p - OUT1) / (GROW1 - OUT1)));
    placeClip(W, H, S.land + (S.cover - S.land) * g, 14 * (1 - g));
    clipTarget = clamp01((p - OUT1) / (FOLD - OUT1)) * clipDur;
    // once the bag holds, the bench's foot melts into the page colour, so the next section does not cut it dry
    bench.style.setProperty('--seam', clamp01((p - FOLD) / (1 - FOLD)).toFixed(3));
    seekClip();
  }

  // 6. Scroll Progress Calculation
  let currentP = 0;

  function calculateProgress() {
    const rect = section.getBoundingClientRect();
    const totalDist = section.offsetHeight - window.innerHeight;
    if (totalDist <= 0) return 0;
    const p = -rect.top / totalDist;
    return Math.max(0, Math.min(1, p));
  }

  // The scroll gives a target; what is shown follows it with a ~0.14 s damping, so a mouse wheel's 100 px steps
  // glide instead of jumping (camera, flying sheet and fold clip all read the smoothed value).
  let targetP = 0;
  let smoothRaf = null;
  let lastSmooth = 0;
  function applyP(p) {
    currentP = p;
    updateCaptions(p);
    updateBench(p);
    sendProgress(p);
  }
  function smoothStep(now) {
    const dt = lastSmooth ? Math.min(0.1, (now - lastSmooth) / 1000) : 1 / 60;
    lastSmooth = now;
    const d = targetP - currentP;
    if (Math.abs(d) < 0.0003) {
      applyP(targetP);
      smoothRaf = null;
      lastSmooth = 0;
      return;
    }
    applyP(currentP + d * (1 - Math.exp(-dt / 0.14)));
    smoothRaf = requestAnimationFrame(smoothStep);
  }
  function setTargetP(p) {
    targetP = p;
    // a jump (anchor link, reload mid-page) goes straight there instead of racing through the tour
    if (Math.abs(p - currentP) > 0.2) {
      applyP(p);
      return;
    }
    if (!smoothRaf) smoothRaf = requestAnimationFrame(smoothStep);
  }
  function handleScroll() {
    setTargetP(calculateProgress());
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });

  // Recorder hook (frame-by-frame video capture, used by a local script only): put the block at progress p and the
  // press at time t, resolve when the iframe has drawn it and the fold clip has seeked. Idle on the live site.
  let drawnWait = null;
  window.__prensaFrame = (p, t) =>
    new Promise((resolve) => {
      if (smoothRaf) cancelAnimationFrame(smoothRaf);
      smoothRaf = null;
      targetP = p;
      currentP = p;
      updateCaptions(p);
      updateBench(p);
      const id = Math.random();
      drawnWait = { id, resolve: () => {
        const done = () => (clipSeeking ? setTimeout(done, 5) : requestAnimationFrame(() => resolve()));
        done();
      } };
      postToIframe({ type: 'prensa:clock', p, t, id });
    });

  // 7. GSAP ScrollTrigger Integration (if loaded)
  function initScrollTrigger() {
    if (window.ScrollTrigger && window.gsap) {
      window.ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setTargetP(self.progress),
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollTrigger);
  } else {
    initScrollTrigger();
  }

  // 7. Theme Change Observation
  const themeObserver = new MutationObserver(() => {
    sendTheme();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // 8. Communication with Iframe
  window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;
    const { type } = event.data;

    if (type === 'prensa:drawn') {
      if (drawnWait && drawnWait.id === event.data.id) { drawnWait.resolve(); drawnWait = null; }
    } else if (type === 'prensa:ready') {
      sendTheme();
      sendProgress(currentP);
      if (isSectionVisible) sendVisible(true);
      if (poster) poster.classList.add('is-hidden');
      if (iframe) iframe.classList.add('is-ready');
    } else if (type === 'prensa:fallback') {
      // GPU unable to hold 20 fps at lowest tier -> switch back to poster
      if (iframe) {
        iframe.style.display = 'none';
      }
      if (poster) {
        poster.classList.remove('is-hidden');
        poster.style.display = 'block';
      }
    }
  });
})();
