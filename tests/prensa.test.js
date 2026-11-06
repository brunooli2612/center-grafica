import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('Prensa offset "Como fazemos" section exists between #como-funciona and #orcamento with lazy iframe and 8 captions', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'index.html must exist');

  const html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Section exists with correct ID and aria
  assert.match(html, /<section[^>]+id="como-fazemos"[^>]*>/);

  // 2. Positioned between #como-funciona and #orcamento
  const idxFunciona = html.indexOf('id="como-funciona"');
  const idxFazemos = html.indexOf('id="como-fazemos"');
  const idxOrcamento = html.indexOf('id="orcamento"');

  assert.ok(idxFunciona !== -1, '#como-funciona must exist');
  assert.ok(idxFazemos !== -1, '#como-fazemos must exist');
  assert.ok(idxOrcamento !== -1, '#orcamento must exist');
  assert.ok(
    idxFunciona < idxFazemos && idxFazemos < idxOrcamento,
    '#como-fazemos must be placed between #como-funciona and #orcamento'
  );

  // 3. Iframe is lazy (no src attribute in HTML) and has title
  const iframeMatch = html.match(/<iframe([^>]+)>/);
  assert.ok(iframeMatch, 'iframe must exist in #como-fazemos');
  const iframeAttrs = iframeMatch[1];
  assert.doesNotMatch(iframeAttrs, /(?<!data-)src\s*=/i, 'iframe must NOT have a src attribute in raw HTML (lazy)');
  assert.match(iframeAttrs, /data-src="assets\/prensa\/prensa-site\.html"/, 'iframe must define data-src');
  assert.match(iframeAttrs, /title="Prensa offset por dentro"/, 'iframe must have title attribute');
  assert.match(iframeAttrs, /aria-hidden="true"/, 'iframe must have aria-hidden');
  assert.match(iframeAttrs, /tabindex="-1"/, 'iframe must have tabindex="-1"');

  // 4. Section Title and Lead
  assert.match(html, /A sua ideia no papel!/);
  assert.match(
    html,
    /Na offset, a imagem passa por três cilindros antes de chegar na folha\. Role para ver por dentro\./
  );

  // 5. The 8 stage captions are present in the HTML (etapas 0-7)
  const captions = [
    'Esta é uma impressora offset por dentro. A sua arte passa por aqui.',
    'Três cilindros giram juntos: chapa, blanqueta e impressão.',
    'Primeiro, água. Ela molha a chapa onde não pode ter tinta.',
    'Depois, a tinta. Os rolos espalham uma camada fina e por igual.',
    'A chapa leva a sua arte gravada, legível.',
    'A blanqueta, de borracha, recebe a imagem espelhada…',
    '…e imprime no papel do jeito certo. Uma folha por volta.',
    'Depois vêm o corte, a dobra e a alça. Do papel à sacola.',
  ];
  assert.equal((html.match(/class="prensa-caption-item/g) || []).length, captions.length);

  for (const caption of captions) {
    assert.ok(html.includes(caption), `Caption missing from HTML: "${caption}"`);
  }

  // 6. External stylesheet and script references exist
  assert.match(html, /<link\s+rel="stylesheet"\s+href="css\/prensa\.css"\s*\/?>/);
  assert.match(html, /<script\s+src="js\/prensa-embed\.js"\s+defer><\/script>/);
});
