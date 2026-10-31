/**
 * Modo revisão: abra o site com ?revisao para ver números em cada parte.
 * O cliente cita o número (ex.: "2.3") ao pedir alterações. Sem ?revisao, nada acontece.
 */
(() => {
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
    .rv-toast { position: fixed; right: 12px; bottom: 12px; z-index: 2147483002; background: #ffe600; color: #111;
      font: 700 14px system-ui, sans-serif; padding: 10px 14px; border-radius: 8px; }
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

  const toast = (msg) => {
    const t = document.createElement('div');
    t.className = 'rv-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  };

  const addBadge = (el, num, isBlock) => {
    const b = document.createElement('span');
    b.className = 'rv-badge' + (isBlock ? ' rv-block' : '');
    b.textContent = num;
    b.title = label(el);
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ref = `Item ${num} (${label(el)}): `;
      navigator.clipboard?.writeText(ref).then(() => toast(`Copiado: item ${num}`), () => toast(`Item ${num}`));
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
  panel.innerHTML = `<b>Modo revisão</b><br>Cada parte tem um número amarelo.<br>
    Para pedir mudança, mande no WhatsApp: <b>"no 2.3, trocar ..."</b><br>
    Tocar no número copia a referência.<br><button type="button">Esconder números</button>`;
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
