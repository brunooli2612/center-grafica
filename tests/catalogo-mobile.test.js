import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');
const articles = (html) => html.match(/<article class="product-card[\s\S]*?<\/article>/g) || [];

test('os 8 cards pre-renderizados tem seta e detalhes, na ordem certa', () => {
  const cards = articles(read('index.html'));
  assert.equal(cards.length, 8);
  for (const card of cards) {
    const heading = card.indexOf('product-card__heading');
    const toggle = card.indexOf('product-card__toggle');
    const details = card.indexOf('product-card__details');
    const footer = card.indexOf('product-card__footer');
    assert.ok(heading > -1 && heading < toggle && toggle < details && details < footer);
    assert.match(card, /aria-expanded="false"/);
    assert.match(card, /aria-controls="detalhes-[^"]+"/);
    assert.match(card, /id="detalhes-[^"]+"/);
    assert.match(card, /aria-label="Ver detalhes de [^"]+"/);
    assert.match(card, /product-card__specs/);
    assert.match(card, /finish-chip/);
  }
});

test('card gerado pelo JS tem a mesma estrutura do pre-renderizado', () => {
  const main = read('js/main.js');
  assert.match(main, /product-card__heading/);
  assert.match(main, /product-card__toggle/);
  assert.match(main, /product-card__details/);
  assert.match(main, /aria-controls="detalhes-\$\{product\.id\}"/);
  assert.match(main, /id="detalhes-\$\{product\.id\}"/);
});

test('abrir e fechar funciona por delegacao e heading so responde no celular', () => {
  const bundle = read('js/app.bundle.js');
  assert.match(bundle, /function initCatalogCardToggle\(/);
  assert.match(bundle, /initCatalogCardToggle\(\);/);
  assert.match(bundle, /\(max-width: 640px\)/);
  assert.match(bundle, /classList\.toggle\('is-open'/);
  assert.match(bundle, /setAttribute\('aria-expanded'/);
});

test('sem JS os detalhes continuam visiveis', () => {
  const css = read('css/components.css');
  const html = read('index.html');
  assert.match(html, /<html[^>]*>[\s\S]*?classList\.add\('js'\)[\s\S]*?<\/head>/);
  assert.match(css, /html\.js \.product-card:not\(\.is-open\) \.product-card__details\s*\{[^}]*display: none/);
});

test('no desktop os detalhes mantem o espaco original entre descricao e chips', () => {
  assert.match(read('css/components.css'), /\.product-card__details \{[^}]*gap: var\(--space-4\);/);
});

test('seta so existe no celular e tem area de toque de 44 px', () => {
  const css = read('css/components.css');
  assert.match(css, /\.product-card__toggle\s*\{[^}]*display: none/);
  const mobile = css.slice(css.indexOf('Catálogo compacto no celular'));
  assert.match(mobile, /@media \(max-width: 640px\)/);
  assert.match(mobile, /\.product-card__toggle\s*\{[^}]*width: 2\.75rem;[^}]*height: 2\.75rem;/);
  assert.match(mobile, /prefers-reduced-motion/);
});
