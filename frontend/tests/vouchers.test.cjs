const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Load the real request builder without importing browser-only Zustand storage.
function loadSource(relative) {
  const filename = path.join(__dirname, '..', 'src', relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require(name) {
    if (name === '@/features/cards/legacy') return loadSource('features/cards/legacy.ts');
    throw new Error(`Unexpected dependency: ${name}`);
  } }, { filename });
  return exports;
}
const { buildCheckoutRequest } = loadSource('features/vouchers/checkout.ts');
const address = { receiverName: 'Test Customer', phone: '0900000000', address: 'Test street', ward: '', district: 'Quận 1', province: 'Hồ Chí Minh' };
const product = { id: '12345678-1234-1234-1234-123456789012', name: 'Gift', price: 1, image: '/gift.webp', category: 'Handmade' };

test('physical checkout submits a certificate without accepting a client price or shipping fee', () => {
  const request = buildCheckoutRequest([{ product, quantity: 2 }], address, false);
  assert.equal(request.pricingVersion, 1);
  assert.equal(request.paymentMethod, 'Cod');
  assert.equal(request.items[0].cardType, 'none');
  assert.equal(request.items[0].quantity, 2);
  assert.equal(request.items[0].gift.theme, 'craft-certificate');
  assert.equal(request.items[0].wantNfc, true);
  assert.equal(request.items[0].extraPrice, undefined);
  assert.equal(request.shippingFee, undefined);
  assert.equal(request.items[0].price, undefined);
});

test('web library cards submit their catalog slug, never the user supplied card price', () => {
  const item = { product, quantity: 1, gift: { cardSlug: 'rose-love', cardPrice: -999999, message: 'Hello' } };
  const request = buildCheckoutRequest([item], address, true);
  assert.equal(request.items[0].cardType, 'web_library_3d');
  assert.equal(request.items[0].cardSlug, 'rose-love');
  assert.equal(request.items[0].gift.message, 'Hello');
  assert.equal(request.items[0].gift.cardPrice, undefined);
  assert.equal(request.paymentMethod, 'BankTransfer');
});

test('default personal greeting and a saved certificate use different pricing types', () => {
  const standard = buildCheckoutRequest([{ product, quantity: 1, gift: { message: 'For you' } }], address, false);
  assert.equal(standard.items[0].cardType, 'default');
  const certificate = buildCheckoutRequest([{ product, quantity: 1, gift: { theme: 'craft-certificate' } }], address, false);
  assert.equal(certificate.items[0].cardType, 'none');
});

test('digital templates use catalog pricing and do not send a fabricated shipping address', () => {
  const request = buildCheckoutRequest([{ product: { ...product, id: '3', isDigital: true }, quantity: 1 }], address, false);
  assert.equal(request.items[0].cardType, 'digital');
  assert.equal(request.items[0].cardSlug, 'rose-love');
  assert.equal(request.items[0].productId, '00000000-0000-0000-0000-000000000000');
  assert.equal(request.receiverAddress, 'Online');
  assert.equal(request.paymentMethod, 'BankTransfer');
});

test('a slug stored on a model or product survives checkout and quantities are not silently replaced', () => {
  const request = buildCheckoutRequest([{ product, quantity: 0, gift: { threeDModelUrl: 'slug:heart-key' } }], address, false);
  assert.equal(request.items[0].cardSlug, 'heart-key');
  assert.equal(request.items[0].quantity, 0);
  assert.equal(request.items[0].gift.threeDModelUrl, 'slug:heart-key');
});
