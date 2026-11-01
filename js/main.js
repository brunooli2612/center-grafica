import {
  CATALOG_PRODUCTS,
  PREPRESS_CHECKLIST_ITEMS,
  PRODUCT_CATEGORIES
} from './catalog-data.js';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  evaluatePrepressChecklist,
  filterProducts,
  recommendPrintProcess,
  validateQuoteRequest
} from './quote-engine.js';

const THEME_STORAGE_KEY = 'center_grafica_theme_pref';

const ICONS = {
  'shopping-bag': `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  box: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
  flag: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
  book: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
  'id-card': `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`
};

const state = {
  activeCategory: 'todos',
  searchQuery: '',
  selectedProductId: CATALOG_PRODUCTS[0].id,
  quantity: CATALOG_PRODUCTS[0].minQty,
  finish: CATALOG_PRODUCTS[0].finishes[0],
  artworkStatus: 'Já tenho a arte pronta (PDF/CDR/AI)',
  deliveryMode: 'retirada-teresina',
  cityState: '',
  customerName: '',
  notes: '',
  prepressChecks: {
    cmyk: true,
    bleed3mm: true,
    outlinedFonts: true,
    dpi300: true
  }
};

function initThemeSwitcher() {
  const htmlEl = document.documentElement;
  const buttons = Array.from(document.querySelectorAll('[data-theme-option]'));
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';

  // "Auto" segue o claro/escuro do sistema operacional
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  let currentMode = savedTheme;

  function applyTheme(mode) {
    currentMode = mode;
    const resolved = mode === 'system' ? (systemDark.matches ? 'dark' : 'light') : mode;
    htmlEl.setAttribute('data-theme', resolved);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    buttons.forEach((btn) => {
      const isSelected = btn.getAttribute('data-theme-option') === mode;
      btn.setAttribute('aria-checked', String(isSelected));
    });
  }

  applyTheme(savedTheme);

  systemDark.addEventListener('change', () => {
    if (currentMode === 'system') applyTheme('system');
  });

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      applyTheme(btn.getAttribute('data-theme-option'));
    });

    btn.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const next = buttons[(index + 1) % buttons.length];
        next.focus();
        applyTheme(next.getAttribute('data-theme-option'));
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = buttons[(index - 1 + buttons.length) % buttons.length];
        prev.focus();
        applyTheme(prev.getAttribute('data-theme-option'));
      }
    });
  });
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('primary-nav');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('is-open', !expanded);
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
    });
  });
}

function initTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('[data-tilt-card]');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      const rotateX = (0.5 - (y / rect.height)) * 6;

      card.style.setProperty('--sheen-x', `${pctX.toFixed(1)}%`);
      card.style.setProperty('--sheen-y', `${pctY.toFixed(1)}%`);
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const CATALOG_FLIP_DURATION = 400;
const CATALOG_FLIP_EXIT_DURATION = 350;
const CATALOG_FLIP_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

function renderCategoryPills() {
  const container = document.getElementById('catalog-category-pills');
  if (!container) return;

  const existingButtons = container.querySelectorAll('[data-category]');
  if (!container.dataset.initialized || existingButtons.length !== PRODUCT_CATEGORIES.length) {
    container.innerHTML = PRODUCT_CATEGORIES.map(
      (cat) => `
      <button
        type="button"
        class="filter-pill"
        data-category="${cat.id}"
        aria-pressed="${state.activeCategory === cat.id}"
      >
        ${cat.label}
      </button>
    `
    ).join('');
    container.dataset.initialized = 'true';

    container.querySelectorAll('[data-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextCategory = btn.getAttribute('data-category');
        if (nextCategory === state.activeCategory) {
          btn.setAttribute('aria-pressed', 'true');
          return;
        }
        state.activeCategory = nextCategory;
        renderCategoryPills();
        renderCatalogGrid({ animate: true });
      });
    });
    return;
  }

  existingButtons.forEach((btn) => {
    const isActive = btn.getAttribute('data-category') === state.activeCategory;
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function buildProductCardHtml(product) {
  const isSelected = product.id === state.selectedProductId;
  return `
      <article class="product-card ${isSelected ? 'is-selected' : ''}" data-product-card="${product.id}">
        <div class="product-card__top">
          <div class="product-card__icon">
            ${ICONS[product.icon] || ICONS.layers}
          </div>
          <span class="product-card__badge">${product.badge}</span>
        </div>

        <div>
          <span class="product-card__category">${product.categoryLabel}</span>
          <h3 class="product-card__title">${product.name}</h3>
        </div>

        <p class="product-card__specs">${product.specs}</p>

        <div class="product-card__finishes" aria-label="Acabamentos mais pedidos">
          ${product.finishes
            .slice(0, 3)
            .map((fin) => `<span class="finish-chip">${fin}</span>`)
            .join('')}
        </div>

        <div class="product-card__footer">
          <div class="product-card__min">
            <span>Tiragem sugerida</span>
            <strong>A partir de ${product.minQty} ${product.minQty === 1 ? 'un.' : 'un.'}</strong>
          </div>
          <button
            type="button"
            class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'}"
            data-select-product="${product.id}"
          >
            ${isSelected ? 'Selecionado' : 'Orçar este item'}
          </button>
        </div>
      </article>
    `;
}

function createProductCardElement(product) {
  const template = document.createElement('template');
  template.innerHTML = buildProductCardHtml(product).trim();
  return template.content.firstElementChild;
}

function syncProductCardSelection(card, product) {
  const isSelected = product.id === state.selectedProductId;
  card.classList.toggle('is-selected', isSelected);
  const btn = card.querySelector('[data-select-product]');
  if (btn) {
    btn.classList.toggle('btn-primary', isSelected);
    btn.classList.toggle('btn-secondary', !isSelected);
    btn.textContent = isSelected ? 'Selecionado' : 'Orçar este item';
  }
}

function renderEmptyCatalogState(grid, preserveExiting = false) {
  if (!preserveExiting) {
    grid.innerHTML = '';
  }
  const emptyWrap = document.createElement('div');
  emptyWrap.className = 'catalog-empty';
  emptyWrap.setAttribute('role', 'status');
  emptyWrap.innerHTML = `
    <h3>Nenhum item encontrado para "${state.searchQuery}"</h3>
    <p>Produzimos projetos gráficos sob medida. Limpe o filtro ou peça seu orçamento personalizado abaixo.</p>
    <button type="button" class="btn btn-secondary" id="reset-catalog-btn">
      Mostrar todos os produtos
    </button>
  `;
  grid.appendChild(emptyWrap);

  const resetBtn = emptyWrap.querySelector('#reset-catalog-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.activeCategory = 'todos';
      state.searchQuery = '';
      const searchInput = document.getElementById('catalog-search-input');
      if (searchInput) searchInput.value = '';
      renderCategoryPills();
      renderCatalogGrid({ animate: true });
    });
  }
}

function renderCatalogGrid({ animate = false } = {}) {
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('catalog-results-count');
  if (!grid) return;

  const filtered = filterProducts({
    category: state.activeCategory,
    query: state.searchQuery
  });

  if (countEl) {
    countEl.textContent =
      filtered.length === 1
        ? '1 solução encontrada'
        : `${filtered.length} soluções encontradas`;
  }

  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate =
    animate &&
    !reducedMotion &&
    typeof Element !== 'undefined' &&
    typeof Element.prototype.animate === 'function';

  if (!shouldAnimate) {
    grid.querySelectorAll('.product-card').forEach((card) => {
      if (typeof card.getAnimations === 'function') {
        card.getAnimations().forEach((anim) => anim.cancel());
      }
    });

    if (filtered.length === 0) {
      renderEmptyCatalogState(grid, false);
      return;
    }

    grid.innerHTML = filtered.map((product) => buildProductCardHtml(product)).join('');
    return;
  }

  // FLIP (First, Last, Invert, Play)
  const gridRect = grid.getBoundingClientRect();
  const firstStates = new Map();
  const activeCardMap = new Map();

  // Remove imediatamente qualquer card em saída de uma troca anterior interrompida
  grid.querySelectorAll('.product-card.is-flip-exiting').forEach((exitingCard) => {
    if (typeof exitingCard.getAnimations === 'function') {
      exitingCard.getAnimations().forEach((anim) => anim.cancel());
    }
    exitingCard.remove();
  });

  // 1. FIRST: mede posição e opacidade atuais dos cards ativos
  grid.querySelectorAll('.product-card[data-product-card]:not(.is-flip-exiting)').forEach((card) => {
    const id = card.getAttribute('data-product-card');
    const rect = card.getBoundingClientRect();
    const width = card.offsetWidth || rect.width;
    const height = card.offsetHeight || rect.height;
    const opacity = parseFloat(window.getComputedStyle(card).opacity);
    firstStates.set(id, {
      left: rect.left + rect.width / 2 - width / 2,
      top: rect.top + rect.height / 2 - height / 2,
      width,
      height,
      opacity: Number.isFinite(opacity) && opacity > 0.05 ? opacity : 1
    });
    activeCardMap.set(id, card);
    if (typeof card.getAnimations === 'function') {
      card.getAnimations().forEach((anim) => anim.cancel());
    }
    card.classList.remove('is-flip-moving');
  });

  const prevEmpty = grid.querySelector('.catalog-empty');
  if (prevEmpty) prevEmpty.remove();

  const nextIds = new Set(filtered.map((p) => p.id));

  // Cards que saem: fixados na coordenada antiga e esmaecem
  activeCardMap.forEach((card, id) => {
    if (nextIds.has(id)) return;

    const first = firstStates.get(id);
    const left = first.left - gridRect.left;
    const top = first.top - gridRect.top;

    card.classList.add('is-flip-exiting');
    card.setAttribute('aria-hidden', 'true');
    card.querySelectorAll('button, a, input, [tabindex]').forEach((el) => {
      el.setAttribute('tabindex', '-1');
    });
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.width = `${first.width}px`;
    card.style.height = `${first.height}px`;

    const exitAnim = card.animate(
      [
        { opacity: first.opacity, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.95)' }
      ],
      {
        duration: CATALOG_FLIP_EXIT_DURATION,
        easing: CATALOG_FLIP_EASING,
        fill: 'forwards'
      }
    );

    let exitTimer = null;
    const removeExiting = () => {
      if (exitTimer) {
        clearTimeout(exitTimer);
        exitTimer = null;
      }
      if (card.parentNode) card.remove();
    };
    exitTimer = setTimeout(removeExiting, CATALOG_FLIP_EXIT_DURATION + 40);
    exitAnim.onfinish = removeExiting;
    exitAnim.oncancel = removeExiting;
  });

  if (filtered.length === 0) {
    renderEmptyCatalogState(grid, true);
    const newEmptyEl = grid.querySelector('.catalog-empty');
    if (newEmptyEl) {
      newEmptyEl.animate(
        [
          { opacity: 0, transform: 'scale(0.96)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        {
          duration: CATALOG_FLIP_DURATION,
          easing: CATALOG_FLIP_EASING
        }
      );
    }
    return;
  }

  // 2. Atualiza o DOM mantendo a instância dos cards que permanecem
  const finalCards = filtered.map((product) => {
    let card = activeCardMap.get(product.id);
    if (card) {
      syncProductCardSelection(card, product);
    } else {
      card = createProductCardElement(product);
    }
    grid.appendChild(card);
    return { product, card };
  });

  // 3. LAST, INVERT & PLAY
  finalCards.forEach(({ product, card }) => {
    const first = firstStates.get(product.id);
    card.classList.add('is-flip-moving');

    let anim = null;
    if (first) {
      const lastRect = card.getBoundingClientRect();
      const dx = first.left - lastRect.left;
      const dy = first.top - lastRect.top;
      const startOpacity = first.opacity < 0.99 ? first.opacity : 1;

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || startOpacity < 1) {
        anim = card.animate(
          [
            {
              transform: `translate(${dx}px, ${dy}px)`,
              opacity: startOpacity
            },
            {
              transform: 'translate(0px, 0px)',
              opacity: 1
            }
          ],
          {
            duration: CATALOG_FLIP_DURATION,
            easing: CATALOG_FLIP_EASING
          }
        );
      }
    } else {
      anim = card.animate(
        [
          {
            opacity: 0,
            transform: 'scale(0.94)'
          },
          {
            opacity: 1,
            transform: 'scale(1)'
          }
        ],
        {
          duration: CATALOG_FLIP_DURATION,
          easing: CATALOG_FLIP_EASING
        }
      );
    }

    if (anim) {
      let moveTimer = null;
      const clearMoving = () => {
        if (moveTimer) {
          clearTimeout(moveTimer);
          moveTimer = null;
        }
        card.classList.remove('is-flip-moving');
      };
      moveTimer = setTimeout(() => {
        if (anim.playState === 'running') anim.finish();
        clearMoving();
      }, CATALOG_FLIP_DURATION + 40);
      anim.onfinish = clearMoving;
      anim.oncancel = clearMoving;
    } else {
      card.classList.remove('is-flip-moving');
    }
  });
}

function populateProductSelect() {
  const selectEl = document.getElementById('quote-product-select');
  if (!selectEl) return;

  selectEl.innerHTML =
    CATALOG_PRODUCTS.map(
      (prod) => `<option value="${prod.id}">${prod.name}</option>`
    ).join('') +
    `<option value="projeto-sob-medida">Outro material personalizado (Sob medida)</option>`;

  selectEl.value = state.selectedProductId;
}

function updateProductDependentFields(productId, preserveQuantity = false) {
  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  const finishSelect = document.getElementById('quote-finish-select');
  const qtyInput = document.getElementById('quote-quantity-input');
  const presetsContainer = document.getElementById('quantity-presets');

  if (product) {
    if (!preserveQuantity) {
      state.quantity = product.minQty;
      if (qtyInput) qtyInput.value = String(product.minQty);
    }

    if (finishSelect) {
      finishSelect.innerHTML =
        product.finishes
          .map((fin) => `<option value="${fin}">${fin}</option>`)
          .join('') +
        `<option value="Quero recomendação técnica da Center Gráfica">Quero recomendação da Center Gráfica</option>`;
      state.finish = product.finishes[0];
      finishSelect.value = state.finish;
    }

    if (presetsContainer) {
      // Marca as tiragens que já entram em Offset (melhor custo unitário),
      // só quando a linha mistura Digital e Offset
      const isOffset = (qty) => /Offset Industrial/.test(recommendPrintProcess(product.id, qty).process);
      const offsetCount = product.suggestedQuantities.filter(isOffset).length;
      const markOffset = offsetCount > 0 && offsetCount < product.suggestedQuantities.length;

      presetsContainer.innerHTML = product.suggestedQuantities
        .map(
          (qty) => `
          <button
            type="button"
            class="qty-chip"
            data-preset-qty="${qty}"
            aria-pressed="${Number(state.quantity) === qty}"
          >
            ${qty} un.${markOffset && isOffset(qty) ? ' <span class="qty-chip__tag">Offset</span>' : ''}
          </button>
        `
        )
        .join('');

      presetsContainer.querySelectorAll('[data-preset-qty]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const val = Number(chip.getAttribute('data-preset-qty'));
          state.quantity = val;
          if (qtyInput) qtyInput.value = String(val);
          updateProductDependentFields(state.selectedProductId, true);
          syncQuoteUI();
        });
      });
    }
  } else {
    if (finishSelect) {
      finishSelect.innerHTML = `
        <option value="Quero recomendação da Center Gráfica">Quero recomendação da Center Gráfica</option>
        <option value="Impressão Offset + Acabamento Laminado">Impressão Offset + Acabamento Laminado</option>
        <option value="Comunicação Visual (Vinil / Lona)">Comunicação Visual (Vinil / Lona)</option>
      `;
      state.finish = finishSelect.value;
    }
    if (presetsContainer) {
      presetsContainer.innerHTML = '';
    }
  }
}

function syncQuoteUI() {
  const productObj = CATALOG_PRODUCTS.find((p) => p.id === state.selectedProductId);
  const productName = productObj ? productObj.name : 'Projeto Gráfico Sob Medida';

  const recommendation = recommendPrintProcess(state.selectedProductId, state.quantity);
  const recBadge = document.getElementById('process-recommendation-title');
  const recNote = document.getElementById('process-recommendation-note');
  if (recBadge) recBadge.textContent = recommendation.process;
  if (recNote) recNote.textContent = recommendation.note;

  const cityFieldWrapper = document.getElementById('city-state-wrapper');
  if (cityFieldWrapper) {
    cityFieldWrapper.hidden = state.deliveryMode !== 'envio-nacional';
  }

  const payload = {
    productName,
    quantity: state.quantity,
    finish: state.finish,
    artworkStatus: state.artworkStatus,
    deliveryMode: state.deliveryMode,
    cityState: state.cityState,
    customerName: state.customerName || 'Sua Empresa',
    notes: state.notes
  };

  const previewEl = document.getElementById('whatsapp-message-preview');
  if (previewEl) {
    previewEl.textContent = buildWhatsAppMessage(payload);
  }

  const directLink = document.getElementById('whatsapp-direct-preview-link');
  if (directLink) {
    directLink.href = buildWhatsAppUrl(payload);
  }
}

function selectProductAndScroll(productId, shouldScroll = true) {
  state.selectedProductId = productId;
  const selectEl = document.getElementById('quote-product-select');
  if (selectEl) selectEl.value = productId;

  updateProductDependentFields(productId, false);
  renderCatalogGrid();
  syncQuoteUI();

  if (shouldScroll) {
    const quoteSection = document.getElementById('orcamento');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function renderPrepressChecklist() {
  const container = document.getElementById('prepress-checklist-items');
  if (!container) return;

  container.innerHTML = PREPRESS_CHECKLIST_ITEMS.map(
    (item) => `
    <label class="checklist-item" for="check-${item.id}">
      <input
        type="checkbox"
        id="check-${item.id}"
        data-check-id="${item.id}"
        ${state.prepressChecks[item.id] ? 'checked' : ''}
      />
      <span class="checklist-item__text">
        <strong>${item.label}</strong>
        <span>${item.detail}</span>
      </span>
    </label>
  `
  ).join('');

  container.querySelectorAll('[data-check-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.getAttribute('data-check-id');
      state.prepressChecks[id] = checkbox.checked;
      updatePrepressStatus();
    });
  });

  updatePrepressStatus();
}

function updatePrepressStatus() {
  const statusEl = document.getElementById('prepress-status-box');
  if (!statusEl) return;

  const evaluation = evaluatePrepressChecklist(state.prepressChecks);
  statusEl.className = `prepress-status ${evaluation.ready ? 'is-ready' : 'needs-help'}`;
  statusEl.textContent = evaluation.recommendation;
}

function bindEvents() {
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderCatalogGrid({ animate: true });
    });
  }

  document.addEventListener('click', (event) => {
    const selectBtn = event.target.closest('[data-select-product]');
    if (selectBtn) {
      const prodId = selectBtn.getAttribute('data-select-product');
      triggerPressSpring(selectBtn);
      selectProductAndScroll(prodId, true);
      // Atalhos que já chegam com um acabamento escolhido (ex.: aba /04)
      const finish = selectBtn.getAttribute('data-select-finish');
      const finishSelect = document.getElementById('quote-finish-select');
      if (finish && finishSelect && [...finishSelect.options].some((o) => o.value === finish)) {
        state.finish = finish;
        finishSelect.value = finish;
        syncQuoteUI();
      }
    }
  });

  const productSelect = document.getElementById('quote-product-select');
  if (productSelect) {
    productSelect.addEventListener('change', (e) => {
      state.selectedProductId = e.target.value;
      updateProductDependentFields(state.selectedProductId, false);
      renderCatalogGrid();
      syncQuoteUI();
    });
  }

  const qtyInput = document.getElementById('quote-quantity-input');
  if (qtyInput) {
    qtyInput.addEventListener('input', (e) => {
      state.quantity = Number(e.target.value);
      updateProductDependentFields(state.selectedProductId, true);
      syncQuoteUI();
    });
  }

  const finishSelect = document.getElementById('quote-finish-select');
  if (finishSelect) {
    finishSelect.addEventListener('change', (e) => {
      state.finish = e.target.value;
      syncQuoteUI();
    });
  }

  const artworkSelect = document.getElementById('quote-artwork-select');
  if (artworkSelect) {
    artworkSelect.addEventListener('change', (e) => {
      state.artworkStatus = e.target.value;
      syncQuoteUI();
    });
  }

  const deliverySelect = document.getElementById('quote-delivery-select');
  if (deliverySelect) {
    deliverySelect.addEventListener('change', (e) => {
      state.deliveryMode = e.target.value;
      syncQuoteUI();
    });
  }

  const cityInput = document.getElementById('quote-city-input');
  if (cityInput) {
    cityInput.addEventListener('input', (e) => {
      state.cityState = e.target.value;
      syncQuoteUI();
    });
  }

  const customerInput = document.getElementById('quote-customer-input');
  if (customerInput) {
    customerInput.addEventListener('input', (e) => {
      state.customerName = e.target.value;
      syncQuoteUI();
    });
  }

  const notesInput = document.getElementById('quote-notes-input');
  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      state.notes = e.target.value;
      syncQuoteUI();
    });
  }

  const quoteForm = document.getElementById('quote-builder-form');
  const feedbackEl = document.getElementById('quote-form-feedback');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const productObj = CATALOG_PRODUCTS.find((p) => p.id === state.selectedProductId);
      const productName = productObj ? productObj.name : 'Projeto Gráfico Sob Medida';

      const payload = {
        productName,
        quantity: state.quantity,
        finish: state.finish,
        artworkStatus: state.artworkStatus,
        deliveryMode: state.deliveryMode,
        cityState: state.cityState,
        customerName: state.customerName,
        notes: state.notes
      };

      const validation = validateQuoteRequest(payload);
      if (!validation.valid) {
        if (feedbackEl) {
          feedbackEl.hidden = false;
          feedbackEl.className = 'form-feedback is-error';
          feedbackEl.textContent = validation.errors.join(' ');
          feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Leva o cursor ao primeiro campo obrigatório vazio
          const emptyField = [...quoteForm.querySelectorAll('[required], [aria-required="true"]')].find(
            (field) => !field.value.trim() && field.offsetParent !== null
          );
          if (emptyField) emptyField.focus({ preventScroll: true });
        }
        return;
      }

      if (feedbackEl) {
        feedbackEl.hidden = false;
        feedbackEl.className = 'form-feedback is-success';
        feedbackEl.textContent =
          'Abrindo o WhatsApp da Center Gráfica (86) 98854-5141 com seu pedido preenchido...';
      }

      const url = buildWhatsAppUrl(payload);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // O link do resumo passa pela mesma validação do formulário

  const directLink = document.getElementById('whatsapp-direct-preview-link');

  if (directLink && quoteForm) {

    directLink.addEventListener('click', (event) => {

      event.preventDefault();

      quoteForm.requestSubmit();

    });

  }


  const copyBtn = document.getElementById('copy-quote-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      triggerPressSpring(copyBtn);
      const previewEl = document.getElementById('whatsapp-message-preview');
      if (!previewEl) return;
      try {
        await navigator.clipboard.writeText(previewEl.textContent);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Resumo copiado!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2200);
      } catch {
        // Fallback silencioso
      }
    });
  }
}

/**
 * OpenMontage Recipe: press-release-spring
 * Compressão rápida (0.12s, power1.in) + soltura elástica (0.45s, back.out(2.0)) + pulso de brilho
 */
function triggerPressSpring(buttonEl, glowEl = null) {
  if (
    typeof window.gsap === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const gsap = window.gsap;
  const tl = gsap.timeline();
  tl.to(buttonEl, {
    scale: 0.92,
    duration: 0.12,
    ease: 'power1.in'
  }).to(buttonEl, {
    scale: 1,
    duration: 0.45,
    ease: 'back.out(2.0)'
  });

  if (glowEl) {
    gsap.fromTo(
      glowEl,
      { opacity: 0, scale: 0.85 },
      {
        opacity: 0.75,
        scale: 1.25,
        duration: 0.28,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      }
    );
  }
}

/**
 * OpenMontage HyperFrames Animation Engine
 * Aplica 5 coreografias do skill `hyperframes-animation`:
 * 1. vertical-spring-ticker (Slot-machine elástico no título Hero)
 * 2. css-marker-patterns (Traço manuscrito SVG em "todo o Brasil")
 * 3. split-tilt-cards + sine-wave-loop (Vitrine 3D de produtos com flutuação senoidal em contra-fase)
 * 4. press-release-spring (Feedback tátil com glow radial no CTA principal)
 * 5. Marquee contínuo + ScrollTrigger nos cards
 */
/**
 * Motor autônomo do Ticker do Hero (OpenMontage vertical-spring-ticker):
 * Executa em loop contínuo e resiliente em desktop e mobile,
 * mesmo se o CDN do GSAP falhar, demorar para carregar ou for bloqueado por ad-blocker.
 */
function initVerticalSpringTicker() {
  const tickerStack = document.getElementById('hf-ticker-stack');
  if (!tickerStack) return;

  const items = tickerStack.querySelectorAll('.hf-ticker-item');
  const stepCount = items.length - 1; // Último item é clone do primeiro
  if (stepCount <= 0) return;

  let currentIndex = 0;
  let isCycling = false;

  function advance() {
    if (isCycling) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slotHeight = items[0].getBoundingClientRect().height || 54;

    // Movimento reduzido: troca a palavra só esmaecendo, sem deslizar
    if (isReduced) {
      isCycling = true;
      tickerStack.style.transition = 'opacity 300ms ease';
      tickerStack.style.opacity = '0';
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % stepCount; // pula o clone do fim
        tickerStack.style.transition = 'none';
        tickerStack.style.transform = `translateY(-${currentIndex * slotHeight}px)`;
        void tickerStack.offsetHeight;
        tickerStack.style.transition = 'opacity 300ms ease';
        tickerStack.style.opacity = '1';
        isCycling = false;
      }, 320);
      return;
    }
    currentIndex++;

    // Curva física OpenMontage: back.out(1.7) overshoot com cubic-bezier
    tickerStack.style.transition = 'transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    tickerStack.style.transform = `translateY(-${currentIndex * slotHeight}px)`;

    if (currentIndex >= stepCount) {
      isCycling = true;
      setTimeout(() => {
        tickerStack.style.transition = 'none';
        tickerStack.style.transform = 'translateY(0px)';
        currentIndex = 0;
        isCycling = false;
      }, 580);
    }
  }

  // Avança a cada 2.5 segundos
  setInterval(advance, 2500);

  // Recalcula deslocamento no redimensionamento da janela
  window.addEventListener('resize', () => {
    const slotHeight = items[0].getBoundingClientRect().height || 54;
    tickerStack.style.transform = `translateY(-${currentIndex * slotHeight}px)`;
  });
}

function initOpenMontageMotion() {
  // 1. O Ticker do Hero é executado de forma autônoma e garantida
  initVerticalSpringTicker();

  // 2. Feedback tátil de clique com press-release-spring
  const heroBtn = document.getElementById('hero-primary-cta');
  const heroGlow = document.getElementById('hero-cta-glow');
  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      triggerPressSpring(heroBtn, heroGlow);
    });
  }

  // 3. Melhorias opcionais via GSAP (se disponível e permitido pelo usuário)
  if (
    typeof window.gsap === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const gsap = window.gsap;
  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  // Sublinhado manuscrito em "todo o Brasil"
  const scribblePath = document.getElementById('hf-scribble-path');
  if (scribblePath) {
    gsap.to(scribblePath, {
      strokeDashoffset: 0,
      duration: 0.9,
      delay: 0.45,
      ease: 'power2.inOut'
    });
  }


  // 5. Faixa de especialidades: loop em CSS (@keyframes hf-marquee-scroll).
  //    A velocidade no hover é controlada por initMarqueeHoverSpeed(), fora deste bloco.
}

/**
 * 21st.dev VerticalTabs Interactive Showcase
 * - Auto-play de 5000ms sincronizado com a barra de progresso vertical (.vtabs-progress)
 * - Transição direcional vertical com física de mola (y: direction > 0 ? "-100%" : "100%" -> 0%)
 * - Pausa ao passar o mouse sobre a galeria e controles circulares Prev/Next
 */
function initVerticalTabs() {
  const showcase = document.getElementById('vtabs-showcase');
  if (!showcase) return;

  const tabs = Array.from(showcase.querySelectorAll('[data-vtab-index]'));
  const slides = Array.from(showcase.querySelectorAll('[data-vtab-slide]'));
  const progresses = Array.from(showcase.querySelectorAll('[data-vtab-progress]'));
  const stage = document.getElementById('vtabs-stage');
  const prevBtn = document.getElementById('vtabs-prev');
  const nextBtn = document.getElementById('vtabs-next');

  if (tabs.length === 0 || slides.length === 0) return;

  const AUTO_PLAY_MS = 5000;
  let activeIndex = 0;
  let isPaused = false;
  let progressTween = null;
  let fallbackTimer = null;

  function resetAllProgressBars() {
    progresses.forEach((bar) => {
      if (window.gsap) {
        window.gsap.killTweensOf(bar);
        window.gsap.set(bar, { height: '0%' });
      } else {
        bar.style.height = '0%';
      }
    });
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function startAutoPlayCycle() {
    resetAllProgressBars();
    if (isPaused) return;

    const currentBar = progresses[activeIndex];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (window.gsap && currentBar && !reducedMotion) {
      progressTween = window.gsap.fromTo(
        currentBar,
        { height: '0%' },
        {
          height: '100%',
          duration: AUTO_PLAY_MS / 1000,
          ease: 'none',
          onComplete: () => {
            if (!isPaused) {
              goToSlide((activeIndex + 1) % tabs.length, 1);
            }
          }
        }
      );
    } else {
      if (currentBar) currentBar.style.height = '100%';
      fallbackTimer = setTimeout(() => {
        if (!isPaused) {
          goToSlide((activeIndex + 1) % tabs.length, 1);
        }
      }, AUTO_PLAY_MS);
    }
  }

  function goToSlide(nextIndex, direction = 1) {
    if (nextIndex === activeIndex) return;
    const prevIndex = activeIndex;
    activeIndex = nextIndex;

    tabs.forEach((tab, idx) => {
      const isSelected = idx === activeIndex;
      tab.classList.toggle('is-active', isSelected);
      const tabButton = tab.querySelector('[role=\"tab\"]');
      if (tabButton) tabButton.setAttribute('aria-selected', String(isSelected));
    });

    const prevSlide = slides[prevIndex];
    const nextSlide = slides[activeIndex];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (window.gsap && !reducedMotion && prevSlide && nextSlide) {
      const gsap = window.gsap;
      gsap.killTweensOf([prevSlide, nextSlide]);

      prevSlide.classList.remove('is-active');
      nextSlide.classList.add('is-active');

      gsap.set(prevSlide, { zIndex: 1 });
      gsap.set(nextSlide, {
        zIndex: 2,
        yPercent: direction > 0 ? -100 : 100,
        opacity: 0
      });

      gsap.to(prevSlide, {
        yPercent: direction > 0 ? 100 : -100,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out'
      });

      gsap.to(nextSlide, {
        yPercent: 0,
        opacity: 1,
        duration: 0.62,
        ease: 'back.out(1.22)'
      });
    } else {
      slides.forEach((slide, idx) => {
        slide.classList.toggle('is-active', idx === activeIndex);
      });
    }

    startAutoPlayCycle();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      if (event.target.closest('[data-select-product]')) {
        return;
      }
      if (index === activeIndex) return;
      const dir = index > activeIndex ? 1 : -1;
      isPaused = false;
      goToSlide(index, dir);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const nextIdx = (activeIndex - 1 + tabs.length) % tabs.length;
      goToSlide(nextIdx, -1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const nextIdx = (activeIndex + 1) % tabs.length;
      goToSlide(nextIdx, 1);
    });
  }

  slides.forEach((slide) => {
    slide.addEventListener('click', () => {
      const nextIdx = (activeIndex + 1) % tabs.length;
      goToSlide(nextIdx, 1);
    });
  });

  if (stage) {
    stage.addEventListener('mouseenter', () => {
      isPaused = true;
      if (progressTween) progressTween.pause();
      resetAllProgressBars();
    });

    stage.addEventListener('mouseleave', () => {
      isPaused = false;
      startAutoPlayCycle();
    });
  }

  startAutoPlayCycle();
}

/**
 * Faixa de especialidades (21st.dev LogoMarquee: duration=80, durationOnHover=25).
 * O loop é CSS puro; aqui só muda a velocidade no hover via Web Animations API,
 * com rampa suave em vez de salto. Não depende do GSAP nem é bloqueado por
 * prefers-reduced-motion (o CSS para a faixa nesse caso).
 */
function initMarqueeHoverSpeed() {
  const track = document.getElementById('hf-marquee-track');
  if (!track || typeof track.getAnimations !== 'function') return;

  const HOVER_RATE = 80 / 25; // 80s -> 25s
  const RAMP_MS = 600;
  let rafId = null;

  const getLoop = () =>
    track.getAnimations().find((a) => a.animationName === 'hf-marquee-scroll');

  const rampTo = (target) => {
    const loop = getLoop();
    if (!loop) return;
    cancelAnimationFrame(rafId);
    const start = loop.playbackRate;
    const t0 = performance.now();

    const step = (now) => {
      const p = Math.min(1, (now - t0) / RAMP_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      loop.playbackRate = start + (target - start) * eased;
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  };

  track.addEventListener('mouseenter', () => rampTo(HOVER_RATE));
  track.addEventListener('mouseleave', () => rampTo(1));
}


/**
 * Como funciona: a linha vermelha acompanha a rolagem e acende cada passo.
 * Movimento reduzido: linha cheia e todos os passos acesos, sem acompanhar a rolagem.
 */
function initHowTimeline() {
  const list = document.getElementById('how-steps');
  if (!list) return;
  const steps = [...list.querySelectorAll('.how-step')];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    list.style.setProperty('--how-progress', '1');
    steps.forEach((s) => s.classList.add('is-reached'));
    return;
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = list.getBoundingClientRect();
    const anchor = window.innerHeight * 0.6; // a linha "chega" a 60% da altura da tela
    const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
    list.style.setProperty('--how-progress', progress.toFixed(3));
    steps.forEach((step) => {
      step.classList.toggle('is-reached', step.getBoundingClientRect().top + 12 < anchor);
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

function initApp() {
  initThemeSwitcher();
  initMobileMenu();
  initVerticalTabs();
  initMarqueeHoverSpeed();
  initHowTimeline();
  renderCategoryPills();
  populateProductSelect();
  updateProductDependentFields(state.selectedProductId, false);
  renderCatalogGrid();
  renderPrepressChecklist();
  syncQuoteUI();
  bindEvents();
  initOpenMontageMotion();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
