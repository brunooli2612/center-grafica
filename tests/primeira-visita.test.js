import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');

test('texto de abertura da capa aparece sem esperar animacao', () => {
  assert.doesNotMatch(read('css/main.css'), /\.hero-lead\s*\{\s*animation-delay/);
  assert.doesNotMatch(read('css/main.css'), /\.hero-lead,\s*\.hero-cta-group/);
});

test('fontes vem do proprio site, com prioridade nas duas da capa', () => {
  const html = read('index.html');
  const css = read('css/design-system.css');
  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  for (const file of ['bricolage-grotesque-latin.woff2', 'plus-jakarta-sans-latin.woff2']) {
    assert.ok(fs.existsSync(path.join(rootDir, 'assets/fonts', file)), file);
    assert.match(html, new RegExp(`rel="preload" href="assets/fonts/${file.replace('.', '\\.')}" as="font" type="font/woff2" crossorigin`));
    assert.match(css, new RegExp(`url\\('\\.\\./assets/fonts/${file.replace('.', '\\.')}'\\) format\\('woff2'\\)`));
  }
  assert.ok(fs.existsSync(path.join(rootDir, 'assets/fonts/jetbrains-mono-latin.woff2')));
  assert.equal((css.match(/font-display: swap/g) || []).length, 3);
});

test('GSAP vem do proprio site, na mesma versao', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /cdnjs\.cloudflare\.com/);
  assert.match(html, /<script src="js\/vendor\/gsap\.min\.js" defer><\/script>/);
  assert.match(html, /<script src="js\/vendor\/ScrollTrigger\.min\.js" defer><\/script>/);
  assert.match(read('js/vendor/gsap.min.js'), /GSAP \d+\.\d+\.\d+/);
});

test('fontes e GSAP entram no cache de assets ou seguem revalidando', () => {
  const rule = JSON.parse(read('vercel.json')).headers[0];
  assert.match(rule.source, /woff2/);
});
