import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');

test('SplitText vem do proprio site, na versao do GSAP', () => {
  const html = read('index.html');
  assert.match(html, /'js\/vendor\/SplitText\.min\.js',\s*'js\/app\.bundle\.js'/);
  assert.match(read('js/vendor/gsap.min.js'), /GSAP 3\.13\.0/);
  assert.match(read('js/vendor/ScrollTrigger.min.js'), /3\.13\.0/);
  assert.match(read('js/vendor/SplitText.min.js'), /3\.13\.0/);
});

test('titulos das secoes sobem por linha, depois que a pagina assentou', () => {
  const bundle = read('js/app.bundle.js');
  assert.match(bundle, /function initSectionTitleReveal\(gsap\)/);
  assert.match(bundle, /initSectionTitleReveal\(gsap\);/);
  assert.match(bundle, /SplitText\.create\(/);
  assert.match(bundle, /new IntersectionObserver\(/);
  assert.match(bundle, /document\.fonts\.ready/);
  assert.match(bundle, /requestIdleCallback/);
  for (const id of ['portfolio-heading', 'catalog-heading', 'how-heading', 'quote-heading', 'features-heading']) {
    assert.match(bundle, new RegExp(`'${id}'`));
  }
  assert.doesNotMatch(bundle, /'como-fazemos-heading'/);
});

test('barra das abas anima por transform', () => {
  const bundle = read('js/app.bundle.js');
  assert.match(bundle, /scaleY: 0/);
  assert.match(bundle, /scaleY: 1/);
  assert.doesNotMatch(bundle, /\{ height: '0%' \}|height: '100%'|bar\.style\.height|currentBar\.style\.height/);
  const css = read('css/components.css');
  assert.match(css, /\.vtabs-progress \{[^}]*height: 100%;[^}]*transform: scaleY\(0\);[^}]*transform-origin: top;/);
});
