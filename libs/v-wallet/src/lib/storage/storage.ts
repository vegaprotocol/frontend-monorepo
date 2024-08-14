import { type SyncMapLikeStorage, type MapLikeStorage } from '../utils';

const wrappedLocalStorage = {
  async get(key: string) {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  },
  async set(key: string, val: unknown) {
    return localStorage.setItem(key, JSON.stringify(val, null, '\t'));
  },
  async clear() {
    localStorage.clear();
  },
  async delete(key: string) {
    localStorage.removeItem(key);
  },
};

export type AbstractStorage = {
  _prefix: string;

  isSupported(): boolean;
  permanentClearAll(): void;

  _load(): Promise<Record<string, unknown>>;
  has(key: string): Promise<boolean>;
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  values(): Promise<unknown[]>;
  entries(): Promise<[string, unknown][]>;
};

function abstractStorage(storage: MapLikeStorage | SyncMapLikeStorage) {
  // Based on https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea
  return class AbstractStorage {
    _prefix: string;

    static isSupported() {
      return storage != null;
    }

    // Scary name
    static async permanentClearAll() {
      return storage.clear();
    }

    constructor(prefix: string) {
      this._prefix = prefix;
      if (AbstractStorage.isSupported() !== true) {
        throw new Error('Unsupported storage runtime');
      }
    }

    async _load(): Promise<Record<string, unknown>> {
      const res = await storage.get(this._prefix);
      const resp = res ?? {};
      return resp as Record<string, unknown>;
    }

    async has(key: string) {
      return (await this._load())[key] !== undefined;
    }

    async get(key: string) {
      const val = await this._load();
      return val[key];
    }

    async set(key: string, value: unknown) {
      const val = await this._load();
      val[key] = value;
      await storage.set(this._prefix, val);
    }

    async delete(key: string) {
      const val = await this._load();
      const hadKey = val[key] != null;
      if (hadKey) {
        delete val[key];
        await storage.set(this._prefix, val);
      }
      return hadKey;
    }

    async clear() {
      await storage.delete(this._prefix);
    }

    async keys() {
      return Object.keys(await this._load());
    }

    async values() {
      return Object.values(await this._load());
    }

    async entries() {
      return Object.entries(await this._load());
    }
  };
}

export class StorageLocalMap extends abstractStorage(wrappedLocalStorage) {}
export class StorageSessionMap extends abstractStorage(new Map()) {}
