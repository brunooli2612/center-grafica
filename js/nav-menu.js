/* Menu com painéis do cabeçalho (see css/nav-menu.css).
   Desktop: abre no hover ou no clique; um fundo só (.nav-viewport) muda de
   posição e tamanho entre os painéis, e o painel novo entra pelo lado do
   gatilho escolhido. Esc ou clique fora fecham.
   Celular: cada gatilho abre e fecha o seu painel como acordeão.
   Os links de categoria (data-nav-category) também filtram o catálogo. */
(function () {
  const nav = document.getElementById('primary-nav');
  if (!nav) return;
  const pill = nav.closest('.site-header__inner');
  const viewport = nav.querySelector('.nav-viewport');
  const items = Array.from(nav.querySelectorAll('[data-nav-item]'));
  if (!pill || !viewport || !items.length) return;

  const desktop = window.matchMedia('(min-width: 1240px)');
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
  const OPEN_DELAY = 60;
  const CLOSE_DELAY = 180;

  let active = null; // índice do painel aberto (desktop)
  let timer = 0;

  const parts = (i) => {
    const item = items[i];
    return { item, trigger: item.querySelector('.nav-trigger'), panel: item.querySelector('.nav-panel') };
  };

  function place(i) {
    const { trigger, panel } = parts(i);
    const pillBox = pill.getBoundingClientRect();
    const trigBox = trigger.getBoundingClientRect();
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    // centrado no gatilho, sem sair da pílula
    const centre = trigBox.left + trigBox.width / 2 - pillBox.left;
    const x = Math.max(0, Math.min(pillBox.width - w, centre - w / 2));
    panel.style.setProperty('--panel-x', x + 'px');
    viewport.style.setProperty('--panel-x', x + 'px');
    viewport.style.setProperty('--vp-w', w + 'px');
    viewport.style.setProperty('--vp-h', h + 'px');
  }

  function open(i) {
    clearTimeout(timer);
    if (active === i) return;
    const prev = active;
    active = i;
    const { trigger, panel } = parts(i);

    if (prev === null) {
      viewport.classList.remove('is-morphing');
      panel.style.setProperty('--from', '0px');
    } else {
      // o painel novo entra pelo lado do gatilho; o antigo sai pelo outro
      const dir = i > prev ? 1 : -1;
      const old = parts(prev);
      old.trigger.setAttribute('aria-expanded', 'false');
      old.panel.style.setProperty('--from', -dir * 32 + 'px');
      old.panel.classList.remove('is-active');
      panel.style.transition = 'none';
      panel.style.setProperty('--from', dir * 32 + 'px');
      void panel.offsetWidth;
      panel.style.transition = '';
      viewport.classList.add('is-morphing');
    }

    place(i);
    trigger.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-active');
    viewport.classList.add('is-open');
  }

  function close() {
    clearTimeout(timer);
    if (active === null) return;
    const { trigger, panel } = parts(active);
    trigger.setAttribute('aria-expanded', 'false');
    panel.style.setProperty('--from', '0px');
    panel.classList.remove('is-active');
    viewport.classList.remove('is-open', 'is-morphing');
    active = null;
  }

  const later = (fn, ms) => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };

  items.forEach((item, i) => {
    const { trigger, panel } = parts(i);

    trigger.addEventListener('click', () => {
      if (desktop.matches) {
        if (active === i) close();
        else open(i);
        return;
      }
      const expanded = !item.classList.contains('is-expanded');
      item.classList.toggle('is-expanded', expanded);
      trigger.setAttribute('aria-expanded', String(expanded));
    });

    trigger.addEventListener('keydown', (e) => {
      if (!desktop.matches || e.key !== 'ArrowDown') return;
      e.preventDefault();
      open(i);
      const first = panel.querySelector('a');
      if (first) first.focus();
    });

    item.addEventListener('pointerenter', (e) => {
      if (!desktop.matches || !hoverable.matches || e.pointerType !== 'mouse') return;
      if (active === null) later(() => open(i), OPEN_DELAY);
      else open(i);
    });

    item.addEventListener('pointerleave', (e) => {
      if (!desktop.matches || e.pointerType !== 'mouse') return;
      later(close, CLOSE_DELAY);
    });

    // o foco saindo do item (Tab) fecha o painel
    item.addEventListener('focusout', (e) => {
      if (desktop.matches && active === i && !item.contains(e.relatedTarget)) close();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || active === null) return;
    const { trigger } = parts(active);
    close();
    trigger.focus();
  });

  document.addEventListener('pointerdown', (e) => {
    if (active !== null && !items.some((item) => item.contains(e.target))) close();
  });

  // clicar num link fecha o painel (o menu do celular já fecha em app.bundle.js)
  nav.querySelectorAll('.nav-panel a').forEach((link) => {
    link.addEventListener('click', () => {
      close();
      const category = link.getAttribute('data-nav-category');
      if (!category) return;
      const pill = document.querySelector('.filter-pill[data-category="' + category + '"]');
      if (pill && pill.getAttribute('aria-pressed') !== 'true') pill.click();
    });
  });

  window.addEventListener('resize', () => {
    if (active !== null && desktop.matches) place(active);
  });

  desktop.addEventListener('change', () => {
    close();
    items.forEach((item) => {
      item.classList.remove('is-expanded');
      item.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
    });
  });
})();
