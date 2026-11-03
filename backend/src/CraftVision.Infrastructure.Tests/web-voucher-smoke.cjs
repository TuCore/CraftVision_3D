const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const base = process.env.VOUCHER_SMOKE_URL || 'http://127.0.0.1:5199';
const user = process.env.VOUCHER_SMOKE_USER;
const product = process.env.VOUCHER_SMOKE_PRODUCT;
const secret = process.env.VOUCHER_SMOKE_JWT_SECRET;
if (!user || !product || !secret) throw new Error('Provide disposable test user/product IDs and the local test signing key.');
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)) throw new Error('This smoke test only supports localhost.');
function token(id, role) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ sub: id, role, iss: 'VoucherTest', aud: 'VoucherTestWeb', exp: Math.floor(Date.now() / 1000) + 1800 })).toString('base64url');
  return `${header}.${body}.${crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')}`;
}
const admin = token('00000000-0000-0000-0000-000000000001', 'Admin');
const customer = token(user, 'Customer');
async function request(path, method = 'GET', auth, body, expected = 200) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  assert.equal(response.status, expected, `${method} ${path}: ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}
(async () => {
  await request('/api/admin/vouchers', 'GET', undefined, undefined, 401);
  await request('/api/admin/vouchers', 'GET', customer, undefined, 403);
  await request('/api/checkout/quote', 'POST', undefined, {}, 401);
  await request('/api/cart', 'GET', customer);
  let cart = await request('/api/cart/items', 'POST', customer, { productId: product, quantity: 1, selectedOptions: '' });
  assert.equal(cart.items.filter(i => i.productId === product).length, 1);
  cart = await request('/api/cart/items', 'POST', customer, { productId: product, quantity: 2, selectedOptions: 'updated-card' });
  assert.equal(cart.items.find(i => i.productId === product).quantity, 2);
  const settings = { discountPercent: 15, customerLimit: 2, isActive: true, endsAt: null };
  let voucher = (await request('/api/admin/vouchers', 'GET', admin)).find(v => v.discountPercent === 15);
  if (!voucher) voucher = await request('/api/admin/vouchers', 'POST', admin, settings, 201);
  assert.match(voucher.code, /^[A-HJ-NP-Z2-9]{8}$/);
  await request('/api/admin/vouchers', 'POST', admin, settings, 409);
  const body = { pricingVersion: 1, receiverName: 'Local smoke customer', receiverPhone: '0900000000', receiverAddress: 'Hà Nội', paymentMethod: 'Cod', voucherCode: voucher.code.toLowerCase(),
    items: [{ productId: product, quantity: 1, cardType: 'none', wantNfc: true, gift: { giftTitle: 'Certificate', senderName: 'CraftVision', receiverName: 'Local customer', message: 'Local test', messageSource: 'System', theme: 'craft-certificate' } }] };
  const quote = await request('/api/checkout/quote', 'POST', customer, body);
  assert.equal(quote.totalAmount, 114750);
  await request('/api/orders', 'POST', customer, { ...body, expectedTotal: 0 }, 400);
  const order = await request('/api/orders', 'POST', customer, { ...body, expectedTotal: quote.totalAmount }, 201);
  assert.equal(order.voucherUsageStatus, 'Reserved');
  assert.equal(order.totalAmount, quote.totalAmount);
  assert.ok(order.items[0].gift.secretKey);
  await request(`/api/orders/${order.id}/receive`, 'PATCH', customer, undefined, 400);
  await request(`/api/orders/${order.id}/status`, 'PATCH', admin, { status: 'Shipped' }, 204);
  await request(`/api/orders/${order.id}/receive`, 'PATCH', customer, undefined, 204);
  assert.equal((await request(`/api/orders/${order.id}`, 'GET', customer)).voucherUsageStatus, 'Reserved');
  await request(`/api/orders/${order.id}/payment-status`, 'PATCH', admin, { status: 'Paid' }, 204);
  const completed = await request(`/api/orders/${order.id}`, 'GET', customer);
  assert.equal(completed.voucherUsageStatus, 'Used');
  assert.equal(completed.orderStatus, 'Delivered');
  await request('/api/checkout/quote', 'POST', customer, body, 400);
  const history = await request(`/api/admin/vouchers/${voucher.id}/usages`, 'GET', admin);
  assert.equal(history.items[0].status, 'Used');
  const certificate = { ...body, voucherCode: null };
  const cancelled = await request('/api/orders', 'POST', customer, certificate, 201);
  await request(`/api/orders/${cancelled.id}/cancel`, 'PATCH', customer, undefined, 204);
  const replacement = await request('/api/orders', 'POST', customer, { ...certificate, items: [certificate.items[0], { ...certificate.items[0] }] }, 201);
  assert.equal(replacement.items.length, 2);
  assert.equal(new Set(replacement.items.map(i => i.gift.secretKey)).size, 2);
  assert.ok(replacement.items.every(i => i.gift.secretKey !== cancelled.items[0].gift.secretKey));
  assert.equal((await request(`/api/orders/${cancelled.id}`, 'GET', customer)).items[0].gift.secretKey, cancelled.items[0].gift.secretKey);
  console.log(JSON.stringify({ passed: true, voucher: voucher.code, totalAmount: order.totalAmount, lifecycle: 'Reserved -> Delivered/Unpaid -> Delivered/Paid/Used', orderId: order.id }));
})().catch(error => { console.error(error); process.exitCode = 1; });
