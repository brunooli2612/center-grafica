/**
 * Modo revisão: abra o site com ?revisao para ver números em cada parte.
 * O cliente cita o número (ex.: "2.3") ao pedir alterações. Sem ?revisao, nada acontece.
 */
(() => {
  const WHATS = '5586988167128';
  if (!new URLSearchParams(location.search).has('revisao')) return;

  const BLOCKS = 'header.site-header, main > section, footer.site-footer';
  const ITEMS = 'h1, h2, h3, p, img, svg[role="img"], canvas, a.btn, button, [class*="card"], label, input, select, textarea';

  const css = document.createElement('style');
  css.textContent = `
    .rv-layer { position: absolute; inset: 0 auto auto 0; width: 100%; pointer-events: none; z-index: 2147483000; }
    .rv-badge { position: absolute; pointer-events: auto; cursor: pointer; font: 700 12px/1 system-ui, sans-serif;
      background: #ffe600; color: #111; border: 2px solid #111; border-radius: 6px; padding: 3px 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,.35); white-space: nowrap; transform: translate(-4px, -4px); }
    .rv-badge.rv-block { background: #111; color: #ffe600; border-color: #ffe600; font-size: 15px; padding: 5px 9px; }
    .rv-panel { position: fixed; left: 12px; bottom: 12px; z-index: 2147483001; max-width: 320px;
      background: #111; color: #fff; font: 14px/1.4 system-ui, sans-serif; padding: 12px 14px; border-radius: 10px;
      border: 2px solid #ffe600; box-shadow: 0 6px 20px rgba(0,0,0,.4); }
    .rv-panel b { color: #ffe600; }
    .rv-panel button { margin-top: 8px; font: inherit; background: #ffe600; color: #111; border: 0; border-radius: 6px; padding: 4px 10px; cursor: pointer; }
    .rv-modal { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 2147483003;
      display: none; align-items: center; justify-content: center; }
    .rv-card { background: #111; color: #fff; border: 2px solid #ffe600; border-radius: 12px; padding: 16px;
      width: min(92vw, 420px); box-sizing: border-box; font: 14px/1.4 system-ui, sans-serif;
      box-shadow: 0 10px 30px rgba(0,0,0,.5); }
    .rv-title { font: 700 16px/1.2 system-ui, sans-serif; color: #ffe600; margin: 0 0 4px; }
    .rv-sub { font-size: 13px; color: #aaa; margin: 0 0 12px; word-break: break-word; }
    .rv-card textarea { width: 100%; box-sizing: border-box; font: 16px/1.4 system-ui, sans-serif;
      padding: 10px; border-radius: 8px; border: 1px solid #444; background: #1c1c1c; color: #fff; resize: vertical; }
    .rv-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; flex-wrap: wrap; }
    .rv-btn { font: 700 14px/1 system-ui, sans-serif; padding: 10px 14px; border-radius: 8px; border: 0; cursor: pointer; }
    .rv-btn-send { background: #ffe600; color: #111; }
    .rv-btn-cancel { background: #2a2a2a; color: #fff; }
  `;
  document.head.appendChild(css);

  const layer = document.createElement('div');
  layer.className = 'rv-layer';
  const marks = [];

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 8 && r.height > 8 && st.visibility !== 'hidden' && st.display !== 'none';
  };

  const label = (el) => {
    const txt = (el.getAttribute('aria-label') || el.alt || el.textContent || el.placeholder || el.tagName).trim();
    return txt.replace(/\s+/g, ' ').slice(0, 60);
  };

  let modal, titleEl, subEl, inputEl, currentNum = '', currentLabel = '';

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  const openModal = (num, lbl) => {
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'rv-modal';
      modal.innerHTML = `
        <div class="rv-card" role="dialog" aria-modal="true">
          <div class="rv-title"></div>
          <div class="rv-sub"></div>
          <textarea rows="4" placeholder="O que quer mudar aqui? Ex.: trocar o preço para R$ 180"></textarea>
          <div class="rv-actions">
            <button type="button" class="rv-btn rv-btn-cancel">Cancelar</button>
            <button type="button" class="rv-btn rv-btn-send">Enviar no WhatsApp</button>
          </div>
        </div>
      `;
      titleEl = modal.querySelector('.rv-title');
      subEl = modal.querySelector('.rv-sub');
      inputEl = modal.querySelector('textarea');
      modal.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target === modal) closeModal();
      });
      modal.querySelector('.rv-btn-cancel').addEventListener('click', closeModal);
      modal.querySelector('.rv-btn-send').addEventListener('click', () => {
        const text = inputEl.value.trim();
        if (!text) {
          inputEl.focus();
          return;
        }
        const msg = `Revisão do site, item ${currentNum} (${currentLabel}):\n${text}`;
        const url = `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
        if (window.open(url, '_blank') === null) location.href = url;
        inputEl.value = '';
        closeModal();
      });
      addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
      });
      document.body.appendChild(modal);
    }
    currentNum = num;
    currentLabel = lbl;
    titleEl.textContent = `Item ${num}`;
    subEl.textContent = lbl;
    modal.style.display = 'flex';
    inputEl.focus();
  };

  const addBadge = (el, num, isBlock) => {
    const b = document.createElement('span');
    b.className = 'rv-badge' + (isBlock ? ' rv-block' : '');
    b.textContent = num;
    b.title = label(el);
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const lbl = label(el);
      const ref = `Item ${num} (${lbl}): `;
      navigator.clipboard?.writeText(ref).catch(() => {});
      openModal(num, lbl);
    });
    layer.appendChild(b);
    marks.push({ el, b });
  };

  const build = () => {
    document.querySelectorAll(BLOCKS).forEach((block, i) => {
      const n = i + 1;
      addBadge(block, String(n), true);
      let j = 0;
      const seen = new Set();
      block.querySelectorAll(ITEMS).forEach((el) => {
        // evita numerar filhos de algo já numerado (ex.: <p> dentro de um card)
        for (const s of seen) if (s.contains(el)) return;
        if (!visible(el) && !el.closest('[role="tabpanel"]')) return;
        seen.add(el);
        addBadge(el, `${n}.${++j}`, false);
      });
    });
    document.body.appendChild(layer);
    place();
  };

  const place = () => {
    for (const { el, b } of marks) {
      const r = el.getBoundingClientRect();
      const hidden = r.width === 0 && r.height === 0;
      b.style.display = hidden ? 'none' : '';
      b.style.left = `${r.left + scrollX}px`;
      b.style.top = `${r.top + scrollY}px`;
    }
  };

  const panel = document.createElement('div');
  panel.className = 'rv-panel';
  panel.innerHTML = '<b>Modo revisão</b><br>Cada parte tem um número amarelo.<br>Toque no número, escreva o que quer mudar e envie pelo WhatsApp.<br><button type="button">Esconder números</button>';
  panel.querySelector('button').addEventListener('click', (e) => {
    const off = layer.style.display !== 'none';
    layer.style.display = off ? 'none' : '';
    e.target.textContent = off ? 'Mostrar números' : 'Esconder números';
  });

  const start = () => {
    build();
    document.body.appendChild(panel);
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); };
    addEventListener('resize', schedule);
    addEventListener('scroll', schedule, { passive: true });
    new ResizeObserver(schedule).observe(document.body);
    setInterval(place, 1000); // acompanha animações e abas que mudam o layout
  };

  // espera o layout assentar (fontes, 3D, conteúdo gerado pelo bundle)
  addEventListener('load', () => setTimeout(start, 600));
})();
