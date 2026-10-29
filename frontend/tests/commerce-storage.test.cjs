const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createResilientStorage } = require("../node_modules/.commerce-tests/commerceStorage.js");

function memoryStorage(entries = []) {
  const data = new Map(entries);
  return {
    data,
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: key => { data.delete(key); },
  };
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

test("legacy cart migrates only after a durable write and leaves authentication untouched", async () => {
  const value = JSON.stringify({ state: { items: [{ id: "gift", greetingImage: "photo" }] }, version: 1 });
  const legacy = memoryStorage([["craftvision-wishlist", value], ["token", "existing-session"]]);
  const primary = memoryStorage();
  const commit = deferred();
  const storage = createResilientStorage({ ...primary, setItem: async (key, next) => { await commit.promise; primary.setItem(key, next); } }, () => legacy);
  const loading = storage.getItem("craftvision-wishlist");
  await Promise.resolve();
  assert.equal(legacy.getItem("craftvision-wishlist"), value);
  commit.resolve();
  assert.equal(await loading, value);
  assert.equal(legacy.getItem("craftvision-wishlist"), null);
  assert.equal(legacy.getItem("token"), "existing-session");
  assert.equal(await createResilientStorage(primary, () => legacy).getItem("craftvision-wishlist"), value);
});

test("checkout payload larger than localStorage quota survives a fresh storage instance", async () => {
  const primary = memoryStorage();
  const legacy = memoryStorage();
  const value = JSON.stringify({ state: { items: [{ product: { draftValues: { audio: "A".repeat(6_000_000) } } }] }, version: 2 });
  const storage = createResilientStorage(primary, () => legacy);
  await storage.setItem("order-storage", value);
  const restored = createResilientStorage(primary, () => legacy);
  assert.equal(await restored.getItem("order-storage"), value);
  assert.equal(legacy.getItem("order-storage"), null);
});

test("storage quota failures cannot throw from the checkout action and retain the current payload", async () => {
  const error = new DOMException("Full", "QuotaExceededError");
  const primary = { getItem: async () => { throw error; }, setItem: async () => { throw error; }, removeItem: async () => { throw error; } };
  const warnings = [];
  const storage = createResilientStorage(primary, () => null, key => warnings.push(key));
  await assert.doesNotReject(storage.setItem("order-storage", "large-checkout"));
  await assert.doesNotReject(storage.setItem("order-storage", "updated-checkout"));
  assert.equal(await storage.getItem("order-storage"), "updated-checkout");
  assert.deepEqual(warnings, ["order-storage"]);
  assert.equal(storage.hasFailedWrites(), true);
});

test("failed migration preserves the legacy copy and its media", async () => {
  const legacy = memoryStorage([["craftvision-wishlist", "original-card-data"]]);
  const primary = { getItem: async () => null, setItem: async () => { throw new Error("Unavailable"); }, removeItem: async () => {} };
  const storage = createResilientStorage(primary, () => legacy);
  assert.equal(await storage.getItem("craftvision-wishlist"), "original-card-data");
  assert.equal(legacy.getItem("craftvision-wishlist"), "original-card-data");
});

test("writes are ordered and an old hydration response cannot replace current checkout data", async () => {
  const oldRead = deferred(), firstWrite = deferred();
  const data = memoryStorage();
  const primary = {
    ...data,
    getItem: () => oldRead.promise,
    setItem: async (key, value) => { if (value === "first") await firstWrite.promise; data.setItem(key, value); },
  };
  const storage = createResilientStorage(primary, () => null);
  const hydration = storage.getItem("order-storage");
  const first = storage.setItem("order-storage", "first");
  const last = storage.setItem("order-storage", "latest");
  oldRead.resolve("obsolete");
  assert.equal(await hydration, "latest");
  firstWrite.resolve();
  await Promise.all([first, last]);
  assert.equal(data.getItem("order-storage"), "latest");
});

test("clearing checkout removes both copies and prevents later restoration", async () => {
  const primary = memoryStorage([["order-storage", "old"]]);
  const legacy = memoryStorage([["order-storage", "older"], ["other-draft", "keep"]]);
  const storage = createResilientStorage(primary, () => legacy);
  await storage.removeItem("order-storage");
  assert.equal(await storage.getItem("order-storage"), null);
  assert.equal(primary.getItem("order-storage"), null);
  assert.equal(legacy.getItem("order-storage"), null);
  assert.equal(legacy.getItem("other-draft"), "keep");
});
