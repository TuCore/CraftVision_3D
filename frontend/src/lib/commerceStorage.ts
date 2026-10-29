import type { StateStorage } from "zustand/middleware";

export const COMMERCE_STORAGE_WARNING = "craftvision-commerce-storage-warning";
type ResilientStorage = StateStorage & { hasFailedWrites(): boolean };

// Keep large card images/audio outside the small synchronous localStorage quota.
function createIndexedStorage(): StateStorage {
  let database: Promise<IDBDatabase> | null = null;
  const open = () => {
    if (!database) {
      database = new Promise<IDBDatabase>((resolve, reject) => {
        if (typeof indexedDB === "undefined") { reject(new Error("IndexedDB unavailable")); return; }
        const request = indexedDB.open("craftvision-commerce", 1);
        request.onupgradeneeded = () => { request.result.createObjectStore("state"); };
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => { db.close(); database = null; };
          resolve(db);
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("IndexedDB blocked"));
      }).catch((error) => { database = null; throw error; });
    }
    return database;
  };
  const transaction = async (mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<string | null> => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("state", mode);
      const request = operation(tx.objectStore("state"));
      tx.oncomplete = () => resolve(typeof request.result === "string" ? request.result : null);
      tx.onabort = () => reject(tx.error || request.error || new Error("Storage transaction aborted"));
      tx.onerror = () => reject(tx.error || new Error("Storage transaction failed"));
    });
  };
  return {
    getItem: (key) => transaction("readonly", (store) => store.get(key)),
    setItem: async (key, value) => { await transaction("readwrite", (store) => store.put(value, key)); },
    removeItem: async (key) => { await transaction("readwrite", (store) => store.delete(key)); },
  };
}

/** Retain current-session data even if the browser refuses persistent writes. */
export function createResilientStorage(
  primary: StateStorage,
  legacy: () => Pick<Storage, "getItem" | "removeItem"> | null,
  onFailure: (key: string) => void = () => {},
): ResilientStorage {
  const memory = new Map<string, string | null>();
  const writes = new Map<string, Promise<void>>();
  const warned = new Set<string>();
  const warn = (key: string) => {
    if (!warned.has(key)) {
      warned.add(key);
      try { onFailure(key); } catch { /* Reporting must not interrupt checkout. */ }
    }
  };
  const enqueue = (key: string, action: () => Promise<void>) => {
    const write = (writes.get(key) || Promise.resolve()).then(action).catch(() => warn(key));
    writes.set(key, write);
    void write.then(() => { if (writes.get(key) === write) writes.delete(key); });
    return write;
  };
  const storage: ResilientStorage = {
    hasFailedWrites: () => warned.size > 0,
    async getItem(key) {
      if (memory.has(key)) return memory.get(key) ?? null;
      let value: string | null = null;
      try { value = await primary.getItem(key); } catch { /* Try the legacy copy before using session memory. */ }
      if (memory.has(key)) return memory.get(key) ?? null;
      if (value !== null) { memory.set(key, value); return value; }
      try { value = legacy()?.getItem(key) ?? null; } catch { warn(key); }
      if (value !== null) {
        memory.set(key, value);
        // Remove only this legacy key, and only after the IndexedDB transaction commits.
        await storage.setItem(key, value);
      }
      return memory.has(key) ? memory.get(key) ?? null : value;
    },
    setItem(key, value) {
      memory.set(key, value);
      return enqueue(key, async () => {
        await primary.setItem(key, value);
        warned.delete(key);
        try { legacy()?.removeItem(key); } catch { /* The durable copy is already committed. */ }
      });
    },
    removeItem(key) {
      memory.set(key, null);
      return enqueue(key, async () => {
        try { await primary.removeItem(key); } finally {
          try { legacy()?.removeItem(key); } catch { warn(key); }
        }
      });
    },
  };
  return storage;
}

export const commerceStorage = createResilientStorage(createIndexedStorage(), () => {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}, () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(COMMERCE_STORAGE_WARNING));
});
