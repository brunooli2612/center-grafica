import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');

test('gatilho da prensa se realinha quando a posicao da secao muda', () => {
  const embed = read('js/prensa-embed.js');
  assert.match(embed, /new ResizeObserver\(/);
  assert.match(embed, /trigger\.refresh\(\)/);
  assert.match(embed, /addEventListener\('load'/);
  assert.match(embed, /addEventListener\('scrollEnd'/);
});

test('lista de servicos e acordeao, sem papeis de aba invalidos', () => {
  const html = read('index.html');
  const bundle = read('js/app.bundle.js');
  assert.doesNotMatch(html, /class="vtabs-list" role="tablist"/);
  assert.doesNotMatch(html, /class="vtabs-title" role="tab"/);
  assert.equal((html.match(/class="vtabs-title" aria-expanded="(true|false)"/g) || []).length, 4);
  assert.doesNotMatch(bundle, /aria-selected', String\(isSelected\)/);
  assert.match(bundle, /aria-expanded', String\(isSelected\)/);
});

test('menu do celular fecha com Esc, mesmo com acordeao aberto', () => {
  const bundle = read('js/app.bundle.js');
  assert.match(bundle, /event\.key !== 'Escape'/);
  assert.doesNotMatch(bundle, /\.nav-trigger\[aria-expanded="true"\]/);
});

test('botao do menu tem 44 px e chip Offset usa vermelho mais escuro', () => {
  assert.match(read('css/layout.css'), /\.mobile-menu-toggle \{[^}]*width: 2\.75rem;[^}]*height: 2\.75rem;/);
  assert.match(read('css/components.css'), /\.qty-chip__tag \{[^}]*color: var\(--brand-red-hover\);/);
});

test('revisao.js so baixa com ?revisao', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /<script src="js\/revisao\.js"/);
  assert.match(html, /has\('revisao'\)/);
});

test('codigo morto saiu do que vai pro navegador', () => {
  const bundle = read('js/app.bundle.js');
  assert.doesNotMatch(bundle, /initTiltCards/);
  assert.doesNotMatch(bundle, /class ThemeManager/);
  assert.doesNotMatch(read('css/components.css'), /\.portfolio-card/);
});

test('servidor local entrega webp e mp4 com o tipo certo', () => {
  const server = read('server.js');
  assert.match(server, /'\.webp': 'image\/webp'/);
  assert.match(server, /'\.mp4': 'video\/mp4'/);
});
