import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('index.html exists and includes primary WhatsApp (86) 98854-5141, Teresina address, and national shipping', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'index.html must exist');

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Core business facts from @centergrafica Instagram
  assert.match(html, /Center Gráfica/i);
  assert.match(html, /5586988545141/);
  assert.match(html, /\(86\)\s*98854-5141/);
  assert.match(html, /99510-5888/);
  assert.match(html, /3229-5141/);
  assert.match(html, /Walter Alencar,\s*1700/i);
  assert.match(html, /Macaúba/i);
  assert.match(html, /Teresina/i);
  assert.match(html, /todo o Brasil/i);
});

test('index.html has accessible Theme Toggle (light/dark/system) and JSON-LD Schema.org structured data', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Theme Toggle requirements
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /data-theme="light"/);
  assert.match(html, /data-theme-option="light"/);
  assert.match(html, /data-theme-option="dark"/);
  assert.match(html, /data-theme-option="system"/);

  // SEO structured data
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":\s*"LocalBusiness"/);
  assert.match(html, /"@type":\s*"FAQPage"/);
});

test('Impeccable Distill/Quieter & OpenMontage HyperFrames Animation craft floor', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const designCss = fs.readFileSync(path.join(rootDir, 'css/design-system.css'), 'utf8');
  const componentsCss = fs.readFileSync(path.join(rootDir, 'css/components.css'), 'utf8');
  const mainCss = fs.readFileSync(path.join(rootDir, 'css/main.css'), 'utf8');
  const mainJs = fs.readFileSync(path.join(rootDir, 'js/main.js'), 'utf8');
  const allCss = `${designCss}\n${componentsCss}\n${mainCss}`;

  // 1. Confusing technical/formatting strings must be completely removed
  assert.doesNotMatch(html, /REGISTRO CMYK:\s*CALIBRANDO/i);
  assert.doesNotMatch(html, /SANGRIA:\s*3\.0mm/i);
  assert.doesNotMatch(html, /ESCALA\s*1:1/i);
  assert.doesNotMatch(html, /FOLHA DE PROVA/i);
  assert.doesNotMatch(html, /\[OBRIGATÓRIO\]/i);

  // 2. OpenMontage HyperFrames Animation & 21st.dev VerticalTabs choreographies must be present
  assert.match(html, /id="hf-ticker-stack"/); // vertical-spring-ticker
  assert.match(html, /id="hf-scribble-path"/); // css-marker-patterns
  assert.match(html, /id="logo-3d-stage"/); // símbolo 3D da hero (js/logo-3d.js)
  assert.match(html, /id="hero-cta-glow"/); // press-release-spring
  assert.match(html, /id="hf-marquee-track"/); // continuous marquee ribbon
  assert.match(html, /id="vtabs-showcase"/); // 21st.dev VerticalTabs interactive section
  assert.match(html, /data-vtab-progress=/); // 5000ms auto-play progress rail
  assert.match(html, /id="vtabs-stage"/); // directional vertical spring slide stage
  assert.match(html, /id="vtabs-prev"/);
  assert.match(html, /id="vtabs-next"/);
  assert.match(html, /gsap\.min\.js/);
  assert.match(html, /ScrollTrigger\.min\.js/);
  assert.match(mainJs, /initOpenMontageMotion/);
  assert.match(mainJs, /initVerticalTabs/);
  assert.match(mainJs, /triggerPressSpring/);

  // 3. Impeccable craft-floor compliance
  assert.match(designCss, /tabular-nums/);
  assert.match(designCss, /caret-color:\s*var\(--brand-red\)/);
  assert.doesNotMatch(allCss, /background-clip:\s*text/);
  assert.doesNotMatch(allCss, /border-left:\s*4px/);
  assert.doesNotMatch(allCss, /4px\s+4px\s+0px/);
  assert.doesNotMatch(allCss, /0\.01ms\s*!important/);
  assert.match(componentsCss, /@media\s*\(pointer:\s*coarse\)/);
});

test('Marquee ribbon animates with pure CSS (independent of GSAP CDN and reduced-motion early return)', () => {
  const mainCss = fs.readFileSync(path.join(rootDir, 'css/main.css'), 'utf8');
  const bundle = fs.readFileSync(path.join(rootDir, 'js/app.bundle.js'), 'utf8');

  assert.match(mainCss, /\.hf-marquee-track\s*\{[^}]*animation:\s*hf-marquee-scroll\s+80s\s+linear\s+infinite/);
  assert.match(mainCss, /@keyframes\s+hf-marquee-scroll/);
  assert.match(mainCss, /-webkit-mask-image:\s*linear-gradient\(to right, transparent, black 25%, black 75%, transparent\)/);
  assert.match(bundle, /function initMarqueeHoverSpeed/);
  assert.match(bundle, /initMarqueeHoverSpeed\(\);/);
  // A faixa não pode mais depender de tween GSAP no track
  assert.doesNotMatch(bundle, /gsap\.(to|fromTo)\(\s*marqueeTrack/);
});

test('All referenced CSS, JS, and extracted real Instagram portfolio assets exist on disk', () => {
  const requiredFiles = [
    'PRODUCT.md',
    'DESIGN.md',
    'css/design-system.css',
    'css/layout.css',
    'css/components.css',
    'css/main.css',
    'js/catalog-data.js',
    'js/quote-engine.js',
    'js/main.js',
    'js/app.bundle.js',
    'components/ui/vertical-tabs.tsx',
    'components/ui/demo.tsx',
    'lib/utils.ts',
    'server.js',
    'assets/images/mascot-rocket.png',
    'assets/images/portfolio-sacolas.png',
    'assets/images/portfolio-frotas.png',
    'assets/images/portfolio-agendas.png',
    'assets/images/portfolio-terrasco.png',
    'assets/images/logo-center.svg',
    'assets/images/simbolo-center.svg'
  ];

  for (const relPath of requiredFiles) {
    const fullPath = path.join(rootDir, relPath);
    assert.ok(fs.existsSync(fullPath), `Missing required asset: ${relPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 0, `Asset is empty: ${relPath}`);
  }
});
