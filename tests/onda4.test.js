import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');

test('Three.js so baixa quando o palco aparece', () => {
  const loader = read('js/logo-3d.js');
  assert.doesNotMatch(loader, /from 'three'/);
  assert.match(loader, /import\('\.\/logo-3d-scene\.js'\)/);
  assert.match(loader, /new IntersectionObserver\(/);
  assert.match(loader, /requestIdleCallback/);

  const scene = read('js/logo-3d-scene.js');
  assert.match(scene, /from 'three'/);
  assert.match(scene, /export function initLogo3D\(/);
  assert.doesNotMatch(scene, /getElementById/);
});

test('folha e poster da prensa nao baixam na abertura', () => {
  const embed = read('js/prensa-embed.js');
  assert.doesNotMatch(embed, /prensa-bench__sheet" alt="" src=/);
  assert.match(embed, /sheet\.src = 'assets\/prensa\/folha-sacola\.webp'/);
  assert.match(read('index.html'), /<img src="assets\/prensa\/poster\.webp"[^>]*loading="lazy"/);
});

test('imagens e videos tem cache curto no navegador, HTML e codigo nao', () => {
  const config = JSON.parse(read('vercel.json'));
  const rule = config.headers.find((item) => item.source.startsWith('/assets/'));
  assert.ok(rule);
  assert.match(rule.source, /webp/);
  assert.match(rule.source, /mp4/);
  assert.doesNotMatch(rule.source, /html|css|js/);
  const cache = rule.headers.find((header) => header.key === 'Cache-Control');
  assert.equal(cache.value, 'public, max-age=86400, stale-while-revalidate=604800');
  assert.equal(config.headers.length, 1);
});
