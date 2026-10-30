import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATALOG_PRODUCTS,
  PORTFOLIO_ITEMS,
  PRIMARY_WHATSAPP_NUMBER
} from '../js/catalog-data.js';
import {
  filterProducts,
  recommendPrintProcess,
  validateQuoteRequest,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  evaluatePrepressChecklist
} from '../js/quote-engine.js';

test('CATALOG_PRODUCTS contains core Center Grafica product lines and PRIMARY_WHATSAPP_NUMBER is 5586988545141', () => {
  assert.equal(PRIMARY_WHATSAPP_NUMBER, '5586988545141');
  assert.ok(Array.isArray(CATALOG_PRODUCTS));
  assert.ok(CATALOG_PRODUCTS.length >= 8);

  const categories = new Set(CATALOG_PRODUCTS.map((p) => p.category));
  assert.ok(categories.has('embalagens'));
  assert.ok(categories.has('comunicacao-visual'));
  assert.ok(categories.has('brindes-corporativos'));
  assert.ok(categories.has('offset-digital'));

  assert.ok(Array.isArray(PORTFOLIO_ITEMS));
  assert.ok(PORTFOLIO_ITEMS.length >= 4);
});

test('filterProducts filters by category and accent-insensitive query', () => {
  const all = filterProducts({ category: 'todos', query: '' });
  assert.equal(all.length, CATALOG_PRODUCTS.length);

  const embalagens = filterProducts({ category: 'embalagens', query: '' });
  assert.ok(embalagens.length >= 2);
  assert.ok(embalagens.every((p) => p.category === 'embalagens'));

  // Search without accents ("sacola" or "cartao" or "veiculo")
  const bySearch = filterProducts({ category: 'todos', query: 'cartao' });
  assert.ok(bySearch.length >= 1);
  assert.ok(bySearch.some((p) => p.id.includes('cartao')));

  // Unknown category returns empty array safely
  const unknown = filterProducts({ category: 'inexistente', query: '' });
  assert.deepEqual(unknown, []);
});

test('recommendPrintProcess advises Offset vs Digital/Visual based on product and quantity', () => {
  const lowRun = recommendPrintProcess('sacola-personalizada', 100);
  assert.ok(lowRun.process.length > 0);
  assert.ok(lowRun.note.length > 0);

  const highRun = recommendPrintProcess('panfleto-couché', 5000);
  assert.match(highRun.process, /Offset/i);

  const invalidQty = recommendPrintProcess('sacola-personalizada', -10);
  assert.ok(invalidQty.recommendedMinQty > 0);
});

test('validateQuoteRequest rejects invalid quantities, missing customer name, or missing city/state for national shipping', () => {
  const emptyResult = validateQuoteRequest({
    productName: '',
    quantity: 0,
    customerName: '',
    deliveryMode: 'envio-nacional',
    cityState: ''
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.length >= 3);

  const missingCityState = validateQuoteRequest({
    productName: 'Sacolas Personalizadas',
    quantity: 500,
    customerName: 'Supermercado União',
    deliveryMode: 'envio-nacional',
    cityState: '   '
  });
  assert.equal(missingCityState.valid, false);
  assert.ok(missingCityState.errors.some((e) => /cidade|estado|UF/i.test(e)));

  const validLocalPickup = validateQuoteRequest({
    productName: 'Sacolas Personalizadas',
    quantity: 500,
    customerName: 'Supermercado União',
    deliveryMode: 'retirada-teresina',
    cityState: ''
  });
  assert.equal(validLocalPickup.valid, true);
  assert.equal(validLocalPickup.errors.length, 0);
});

test('buildWhatsAppMessage and buildWhatsAppUrl format a structured quote for (86) 98854-5141', () => {
  const payload = {
    productName: 'Personalização de Frotas (Adesivagem)',
    quantity: 3,
    finish: 'Vinil Automotivo + Laminação UV',
    artworkStatus: 'Preciso criar/ajustar a arte na Center',
    deliveryMode: 'envio-nacional',
    cityState: 'São Luís - MA',
    customerName: 'Telego Net',
    notes: 'Picapes Fiat Strada com QR Code nas laterais'
  };

  const message = buildWhatsAppMessage(payload);
  assert.match(message, /Center Gráfica/i);
  assert.match(message, /Personalização de Frotas/);
  assert.match(message, /3/);
  assert.match(message, /São Luís - MA/);
  assert.match(message, /Telego Net/);

  const url = buildWhatsAppUrl(payload);
  assert.ok(url.startsWith('https://wa.me/5586988545141?text='));
  assert.ok(url.includes(encodeURIComponent('Personalização de Frotas')));
});

test('evaluatePrepressChecklist diagnoses print-readiness accurately', () => {
  const allReady = evaluatePrepressChecklist({
    cmyk: true,
    bleed3mm: true,
    outlinedFonts: true,
    dpi300: true
  });
  assert.equal(allReady.ready, true);
  assert.equal(allReady.score, 4);
  assert.equal(allReady.missingLabels.length, 0);

  const partial = evaluatePrepressChecklist({
    cmyk: true,
    bleed3mm: false,
    outlinedFonts: true,
    dpi300: false
  });
  assert.equal(partial.ready, false);
  assert.equal(partial.score, 2);
  assert.equal(partial.missingLabels.length, 2);
  assert.match(partial.recommendation, /pré-impressão|ajuste/i);
});
