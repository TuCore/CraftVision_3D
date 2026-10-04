const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cardTemplates, categories, defaultDraft, fieldsFor, validateDraft } = require('../node_modules/.card-tests/catalog.js');
const { parseDraft } = require('../node_modules/.card-tests/storage.js');

test('API field schema stays in sync with all frontend templates', () => {
  const schema = require('../../api-specs/card-fields.json');
  assert.deepEqual(schema, Object.fromEntries(cardTemplates.map(t => [t.slug, fieldsFor(t)])));
});
test('public data accepts only server media references; imports stay local-only', () => {
  const draft = defaultDraft(cardTemplates[0]);
  draft.values.photo = '/api/cards/media/12345678-1234-1234-1234-123456789012';
  assert.equal(parseDraft(draft, true).values.photo, draft.values.photo);
  assert.throws(() => parseDraft(draft));
  for (const url of ['https://example.com/image.png', '//evil.com/image.png', '/api/cards/media/../private', 'data:image/png;base64,AAAA']) {
    draft.values.photo = url; assert.throws(() => parseDraft(draft, true));
  }
});

test('54 addressable templates, six for every category, with unique field keys', () => {
  assert.equal(cardTemplates.length, 54);
  assert.equal(new Set(cardTemplates.map(card => card.slug)).size, 54);
  for (const category of categories) assert.equal(cardTemplates.filter(card => card.category === category).length, 6);
  for (const card of cardTemplates) {
    const fields = fieldsFor(card);
    assert.equal(new Set(fields.map(field => field.key)).size, fields.length, card.slug);
    assert.ok(card.action && card.reveal && card.model, card.slug);
  }
});
test('every default draft is valid and survives export/import', () => {
  for (const template of cardTemplates) {
    const draft = defaultDraft(template);
    const knownKeys = new Set(fieldsFor(template).map(field => field.key));
    assert.ok(Object.keys(draft.values).every(key => knownKeys.has(key)), template.slug);
    assert.deepEqual(validateDraft(template, draft), {}, template.slug);
    assert.deepEqual(parseDraft(JSON.parse(JSON.stringify(draft))), draft, template.slug);
  }
});
test('required personalization and minimum memory stops are enforced', () => {
  const template = cardTemplates.find(card => card.slug === 'memory-train');
  const draft = defaultDraft(template);
  draft.values.recipient = '   ';
  draft.values.message = '';
  draft.values.memories = [{ 'Tên ga': 'First', 'Kỷ niệm': 'One stop' }];
  const errors = validateDraft(template, draft);
  assert.ok(errors.recipient && errors.message && errors.memories);
});
test('empty list entries and oversized lists are rejected', () => {
  const template = cardTemplates.find(card => card.slug === 'birthday-garden');
  const draft = defaultDraft(template);
  draft.values.wishes = [{ 'Nội dung': '' }];
  assert.ok(validateDraft(template, draft).wishes);
  draft.values.wishes = Array.from({ length: 6 }, () => ({ 'Nội dung': 'Happy' }));
  assert.ok(validateDraft(template, draft).wishes);
  assert.throws(() => parseDraft(draft));
});
test('import accepts only supported versions, templates, colors and inline image formats', () => {
  const draft = defaultDraft(cardTemplates[0]);
  assert.throws(() => parseDraft({ ...draft, version: 99 }));
  assert.throws(() => parseDraft({ ...draft, template: 'missing' }));
  assert.throws(() => parseDraft({ ...draft, values: { ...draft.values, photo: 'https://example.com/photo.jpg' } }));
  assert.throws(() => parseDraft({ ...draft, values: { ...draft.values, photo: 'data:image/svg+xml;base64,abcd' } }));
  assert.throws(() => parseDraft({ ...draft, values: { ...draft.values, accent: 'url(https://example.com)' } }));
});
test('arbitrary imported keys are discarded; inline text remains plain text', () => {
  const draft = defaultDraft(cardTemplates[0]);
  const result = parseDraft({ ...draft, values: { ...draft.values, unknown: 'discard', message: '<script>alert(1)</script>' } });
  assert.equal(result.values.unknown, undefined);
  assert.equal(result.values.message, '<script>alert(1)</script>');
});
