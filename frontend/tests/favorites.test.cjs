const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createStore } = require("zustand/vanilla");
const { createFavoriteState } = require("../node_modules/.favorite-tests/state.js");
const { favoritesApi } = require("../node_modules/.favorite-tests/api.js");

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function setup(api, initialToken = "account-a") {
  let token = initialToken;
  const state = createStore(createFavoriteState(api, () => token));
  return { state, setToken: (next) => { token = next; } };
}

test("favorites survive logout, another login and a fresh browser state through the account API", async () => {
  const accounts = new Map();
  const items = (token) => {
    if (!accounts.has(token)) accounts.set(token, new Set());
    return accounts.get(token);
  };
  const api = {
    list: async (token) => [...items(token)],
    add: async (id, token) => { items(token).add(id); },
    remove: async (id, token) => { items(token).delete(id); },
  };
  const { state, setToken } = setup(api);
  await state.getState().syncFavorites();
  await state.getState().toggleFavorite("flower");
  assert.deepEqual(state.getState().favoriteIds, ["flower"]);
  setToken(null);
  await state.getState().syncFavorites();
  assert.deepEqual(state.getState().favoriteIds, []);
  setToken("account-b");
  await state.getState().syncFavorites();
  assert.deepEqual(state.getState().favoriteIds, []);
  const returning = setup(api).state;
  await returning.getState().syncFavorites();
  assert.deepEqual(returning.getState().favoriteIds, ["flower"]);
  await returning.getState().toggleFavorite("flower");
  assert.deepEqual([...items("account-a")], []);
});

test("a delayed response from a previous account cannot populate the new account", async () => {
  const oldLoad = deferred();
  const { state, setToken } = setup({
    list: (token) => token === "account-a" ? oldLoad.promise : Promise.resolve(["bear"]),
    add: async () => {}, remove: async () => {},
  });
  const firstLoad = state.getState().syncFavorites();
  setToken("account-b");
  await state.getState().syncFavorites();
  oldLoad.resolve(["flower"]);
  await firstLoad;
  assert.deepEqual(state.getState().favoriteIds, ["bear"]);
});

test("logout discards an in-flight add response without leaking favorites", async () => {
  const write = deferred();
  const { state, setToken } = setup({ list: async () => [], add: () => write.promise, remove: async () => {} });
  await state.getState().syncFavorites();
  const operation = state.getState().toggleFavorite("flower");
  setToken(null);
  await state.getState().syncFavorites();
  write.resolve();
  await operation;
  assert.deepEqual(state.getState().favoriteIds, []);
  assert.deepEqual(state.getState().pendingIds, []);
  assert.equal(state.getState().hasSession, false);
});

test("repeated clicks are deduplicated and a failed write keeps the previous state", async () => {
  const write = deferred();
  let calls = 0;
  const { state } = setup({ list: async () => [], add: () => { calls++; return write.promise; }, remove: async () => {} });
  await state.getState().syncFavorites();
  const operation = state.getState().toggleFavorite("flower");
  await state.getState().toggleFavorite("flower");
  assert.equal(calls, 1);
  assert.deepEqual(state.getState().favoriteIds, []);
  write.reject(new Error("Network unavailable"));
  await assert.rejects(operation);
  assert.deepEqual(state.getState().favoriteIds, []);
  assert.deepEqual(state.getState().pendingIds, []);
});

test("refresh does not overwrite an in-flight edit and independent additions both survive", async () => {
  const flower = deferred(), bear = deferred();
  let reads = 0;
  const { state } = setup({ list: async () => { reads++; return []; }, add: (id) => id === "flower" ? flower.promise : bear.promise, remove: async () => {} });
  await state.getState().syncFavorites();
  const first = state.getState().toggleFavorite("flower");
  const second = state.getState().toggleFavorite("bear");
  await state.getState().syncFavorites();
  assert.equal(reads, 1);
  bear.resolve(); flower.resolve();
  await Promise.all([first, second]);
  assert.deepEqual([...state.getState().favoriteIds].sort(), ["bear", "flower"]);
});

test("load failure is visible and can be retried", async () => {
  let fail = true;
  const { state } = setup({ list: async () => { if (fail) throw new Error("Offline"); return ["flower"]; }, add: async () => {}, remove: async () => {} });
  await state.getState().syncFavorites();
  assert.equal(state.getState().loadError, true);
  assert.equal(state.getState().hasLoaded, false);
  fail = false;
  await state.getState().syncFavorites();
  assert.equal(state.getState().loadError, false);
  assert.deepEqual(state.getState().favoriteIds, ["flower"]);
});

test("guests never make account requests", async () => {
  const unexpected = async () => { throw new Error("Unexpected request"); };
  const { state } = setup({ list: unexpected, add: unexpected, remove: unexpected }, null);
  await state.getState().syncFavorites();
  await state.getState().toggleFavorite("flower");
  assert.equal(state.getState().loadError, false);
  assert.deepEqual(state.getState().favoriteIds, []);
});

test("API uses the Gateway, captured authorization and handles empty DELETE responses", async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return options.method === "GET"
      ? new Response(JSON.stringify([{ productId: "flower" }]), { status: 200 })
      : new Response(null, { status: 204 });
  };
  try {
    assert.deepEqual(await favoritesApi.list("account-a"), ["flower"]);
    await favoritesApi.add("flower", "account-a");
    await favoritesApi.remove("flower", "account-a");
    assert.deepEqual(calls.map((call) => [call.url, call.method, call.headers.Authorization]), [
      ["/api/favorites", "GET", "Bearer account-a"],
      ["/api/favorites/flower", "POST", "Bearer account-a"],
      ["/api/favorites/flower", "DELETE", "Bearer account-a"],
    ]);
    global.fetch = async () => new Response(null, { status: 404 });
    await favoritesApi.remove("flower", "account-a");
    await assert.rejects(favoritesApi.add("flower", "account-a"));
  } finally { global.fetch = originalFetch; }
});
