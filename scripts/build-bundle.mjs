import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATALOG_PRODUCTS,
  PORTFOLIO_ITEMS,
  PREPRESS_CHECKLIST_ITEMS,
  PRODUCT_CATEGORIES
} from '../js/catalog-data.js';
import {
  buildWhatsAppMessage,
  evaluatePrepressChecklist
} from '../js/quote-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function stripModuleSyntax(code) {
  return code
    .replace(/^\s*import\s+[\s\S]*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^\s*export\s+const\s+/gm, 'const ')
    .replace(/^\s*export\s+function\s+/gm, 'function ')
    .replace(/^\s*export\s+class\s+/gm, 'class ');
}

const catalogCode = stripModuleSyntax(
  fs.readFileSync(path.join(rootDir, 'js/catalog-data.js'), 'utf8')
);
const engineCode = stripModuleSyntax(
  fs.readFileSync(path.join(rootDir, 'js/quote-engine.js'), 'utf8')
);
const themeCode = stripModuleSyntax(
  fs.readFileSync(path.join(rootDir, 'js/theme-manager.js'), 'utf8')
);
const mainCode = stripModuleSyntax(
  fs.readFileSync(path.join(rootDir, 'js/main.js'), 'utf8')
);

const bundleContent = `/**
 * Center Gráfica — Browser Bundle (Compatível com file:// e http://)
 * Gerado automaticamente a partir dos módulos ES testados via TDD.
 */
(function () {
  'use strict';

${catalogCode}

${engineCode}

${themeCode}

${mainCode}
})();
`;

fs.writeFileSync(path.join(rootDir, 'js/app.bundle.js'), bundleContent, 'utf8');

const SVG_ICONS = {
  'shopping-bag': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M5 7h14l-1 13H6L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>`,
  box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="M3 7l9 5 9-5"/><path d="M12 12v10"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><rect x="2" y="5" width="13" height="11"/><path d="M15 9h4l3 3v4h-7V9Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>`,
  flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M4 21V4"/><path d="M4 4h15l-3 5 3 5H4"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M5 3h13v18H5z"/><path d="M3 6h4"/><path d="M3 10h4"/><path d="M3 14h4"/><path d="M3 18h4"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M3 5h7l2 2h9v12H3V5Z"/><path d="M3 10h18"/></svg>`,
  'id-card': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><rect x="2" y="5" width="20" height="14"/><path d="M6 10h5"/><path d="M6 14h8"/><rect x="15" y="9" width="3" height="4"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></svg>`
};

function getTechIcon(name) {
  return SVG_ICONS[name] || SVG_ICONS.layers;
}

const categoriesHtml = PRODUCT_CATEGORIES.map((cat, idx) => {
  const isActive = idx === 0;
  return `
          <button
            type="button"
            class="category-pill ${isActive ? 'active' : ''}"
            data-category="${cat.id}"
            aria-pressed="${isActive ? 'true' : 'false'}"
          >
            ${cat.label}
          </button>`;
}).join('');

const catalogHtml = CATALOG_PRODUCTS.map(
  (product) => `
        <article class="spec-ledger-row" data-product-card="${product.id}">
          <div class="spec-row-header">
            <span class="spec-row-code">
              ${getTechIcon(product.icon)}
              <span>FICHA #${product.specCode || 'IMP'} // ${product.categoryLabel}</span>
            </span>
            <span class="spec-row-badge">${product.badge}</span>
          </div>

          <div class="spec-row-main">
            <div>
              <h3 class="spec-row-title">${product.name}</h3>
              <p class="spec-row-desc" style="margin-top: 0.45rem;">${product.specs}</p>
            </div>

            <div class="spec-matrix-table">
              <div class="spec-matrix-cell">
                <span class="spec-matrix-label">Substrato / Gramatura</span>
                <span class="spec-matrix-val">${product.substrate || 'Couché / Offset Industrial'}</span>
              </div>
              <div class="spec-matrix-cell">
                <span class="spec-matrix-label">Processo & Cor</span>
                <span class="spec-matrix-val">${product.colorSystem || product.process}</span>
              </div>
            </div>

            <div class="spec-finishes-list" aria-label="Opções de acabamento">
              ${product.finishes
                .slice(0, 3)
                .map((f) => `<span class="spec-finish-tag">${f}</span>`)
                .join('')}
            </div>
          </div>

          <div class="spec-row-footer">
            <span class="spec-min-run">
              Tiragem base: <strong class="mono-num">${product.minQty} un.</strong>
            </span>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              data-select-product="${product.id}"
            >
              Carregar na Ordem
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </button>
          </div>
        </article>`
).join('\n');

const portfolioHtml = PORTFOLIO_ITEMS.map(
  (item) => `
        <article class="portfolio-specimen-cell">
          <div class="specimen-top-bar">
            <span class="specimen-code">${item.code || 'PROVA OFICIAL'}</span>
            <span>${item.category}</span>
          </div>

          <div class="specimen-stage">
            <div class="specimen-photo-wrap crop-frame" data-tilt-specimen>
              <span class="crop-mark tl" aria-hidden="true"></span>
              <span class="crop-mark tr" aria-hidden="true"></span>
              <span class="crop-mark bl" aria-hidden="true"></span>
              <span class="crop-mark br" aria-hidden="true"></span>
              <img src="${item.image}" alt="${item.title} - ${item.client}" loading="lazy" width="350" height="400" />
            </div>
          </div>

          <div class="specimen-body">
            <div>
              <h3 class="specimen-title">${item.title}</h3>
              <p class="specimen-desc" style="margin-top: 0.4rem;">${item.description}</p>
            </div>

            <dl class="specimen-tech-ledger">
              <div>
                <dt>Cliente / Projeto</dt>
                <dd>${item.client}</dd>
              </div>
              <div>
                <dt>Substrato & Acabamento</dt>
                <dd>${item.substrate || 'Padrão Center Gráfica'}</dd>
              </div>
            </dl>

            <div class="specimen-footer">
              <span class="mono-num" style="font-size: 0.72rem; color: var(--ink-muted);">MEDIDA: ${item.dimensions || 'Sob Medida'}</span>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                data-portfolio-product="${item.productRef}"
              >
                Orçar Projeto Similar
              </button>
            </div>
          </div>
        </article>`
).join('\n');

const defaultProduct = CATALOG_PRODUCTS[0];
const productOptionsHtml =
  CATALOG_PRODUCTS.map(
    (p, idx) =>
      `<option value="${p.id}"${idx === 0 ? ' selected' : ''}>[${p.specCode}] ${p.name}</option>`
  ).join('') +
  `<option value="outro">[ESP-09] Outro Impresso / Projeto Sob Medida</option>`;

const finishOptionsHtml =
  defaultProduct.finishes
    .map((f, idx) => `<option value="${f}"${idx === 0 ? ' selected' : ''}>${f}</option>`)
    .join('') +
  `<option value="Recomendar melhor acabamento custo-benefício">Recomendar melhor acabamento custo-benefício</option>`;

const qtyPresetsHtml = defaultProduct.suggestedQuantities
  .map(
    (qty, idx) =>
      `<button type="button" class="qty-chip ${idx === 0 ? 'active' : ''}" data-preset-qty="${qty}">${qty} un.</button>`
  )
  .join('');

const defaultPayload = {
  productId: defaultProduct.id,
  productName: defaultProduct.name,
  quantity: defaultProduct.minQty,
  finish: defaultProduct.finishes[0],
  artworkStatus: 'Já tenho o arquivo fechado (PDF/X-1a, CDR ou AI)',
  deliveryMode: 'retirada-teresina',
  cityState: '',
  customerName: 'Sua Empresa / Nome',
  notes: ''
};

const defaultPreviewText = buildWhatsAppMessage(defaultPayload);

const checklistHtml = PREPRESS_CHECKLIST_ITEMS.map(
  (item) => `
              <label class="preflight-item" for="check-${item.id}">
                <input
                  type="checkbox"
                  id="check-${item.id}"
                  data-check-id="${item.id}"
                  checked
                />
                <span>
                  <span class="preflight-item-title">
                    <span class="preflight-item-code">${item.code || 'RIP'}</span>
                    <span>${item.label}</span>
                  </span>
                  <span class="preflight-item-desc">${item.detail}</span>
                </span>
              </label>`
).join('\n');

const defaultPrepressResult = evaluatePrepressChecklist({
  cmyk: true,
  bleed3mm: true,
  outlinedFonts: true,
  dpi300: true
});

const defaultPrepressStatusHtml = `
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; font-family: var(--font-mono); font-size: 0.74rem;">
                <strong style="text-transform: uppercase;">STATUS DE FECHAMENTO: ${defaultPrepressResult.score}/${defaultPrepressResult.total} REQUISITOS</strong>
                <span style="color: var(--whatsapp-green); font-weight: 600;">[APTO PARA CHAPA / IMPRESSÃO]</span>
              </div>
              <p style="color: var(--ink-secondary); font-size: 0.84rem;">${defaultPrepressResult.recommendation}</p>`;

let indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

indexHtml = indexHtml.replace(
  /<div id="portfolio-grid" class="portfolio-contact-sheet" aria-live="polite">[\s\S]*?<\/div>/,
  `<div id="portfolio-grid" class="portfolio-contact-sheet" aria-live="polite">${portfolioHtml}\n      </div>`
);

indexHtml = indexHtml.replace(
  /<div id="catalog-categories" class="category-tabs" role="tablist" aria-label="Categorias de Produção">[\s\S]*?<\/div>/,
  `<div id="catalog-categories" class="category-tabs" role="tablist" aria-label="Categorias de Produção">${categoriesHtml}\n        </div>`
);

indexHtml = indexHtml.replace(
  /<div id="catalog-grid" class="catalog-ledger-grid" aria-live="polite">[\s\S]*?<\/div>/,
  `<div id="catalog-grid" class="catalog-ledger-grid" aria-live="polite">${catalogHtml}\n      </div>`
);

indexHtml = indexHtml.replace(
  /<select id="quote-product" class="form-control" required>[\s\S]*?<\/select>/,
  `<select id="quote-product" class="form-control" required>${productOptionsHtml}</select>`
);

indexHtml = indexHtml.replace(
  /<div id="quote-qty-presets" class="qty-presets" aria-label="Tiragens padrão de máquina">[\s\S]*?<\/div>/,
  `<div id="quote-qty-presets" class="qty-presets" aria-label="Tiragens padrão de máquina">${qtyPresetsHtml}</div>`
);

indexHtml = indexHtml.replace(
  /<select id="quote-finish" class="form-control">[\s\S]*?<\/select>/,
  `<select id="quote-finish" class="form-control">${finishOptionsHtml}</select>`
);

indexHtml = indexHtml.replace(
  /<pre id="whatsapp-message-preview" class="whatsapp-preview-pre">[\s\S]*?<\/pre>/,
  `<pre id="whatsapp-message-preview" class="whatsapp-preview-pre">${defaultPreviewText}</pre>`
);

indexHtml = indexHtml.replace(
  /<div id="prepress-checklist" class="preflight-list">[\s\S]*?<\/div>/,
  `<div id="prepress-checklist" class="preflight-list">${checklistHtml}\n            </div>`
);

indexHtml = indexHtml.replace(
  /<div id="prepress-status-box" class="preflight-verdict(?: is-ready)?" style="margin-top: var\(--space-4\);" aria-live="polite">[\s\S]*?<\/div>/,
  `<div id="prepress-status-box" class="preflight-verdict is-ready" style="margin-top: var(--space-4);" aria-live="polite">${defaultPrepressStatusHtml}\n            </div>`
);

fs.writeFileSync(path.join(rootDir, 'index.html'), indexHtml, 'utf8');
console.log('Successfully generated js/app.bundle.js and pre-rendered Press Sheet SEO content into index.html');
