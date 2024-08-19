// eslint-disable-next-line no-undef
const wrappedLocalStorage = {
  get(key) {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  },
  set(key, val) {
    return localStorage.setItem(key, JSON.stringify(val, null, '\t'));
  },
  clear() {
    localStorage.clear();
  },
  delete(key) {
    localStorage.removeItem(key);
  },
};

function abstractStorage(storage) {
  // Based on https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea
  return class AbstractStorage {
    static isSupported() {
      return storage != null;
    }

    // Scary name
    static async permanentClearAll() {
      return storage.clear();
    }

    constructor(prefix) {
      this._prefix = prefix;
      if (AbstractStorage.isSupported() !== true) {
        throw new Error('Unsupported storage runtime');
      }
    }

    async _load() {
      return storage.get(this._prefix) ?? {};
    }

    async has(key) {
      return (await this._load())[key] !== undefined;
    }

    async get(key) {
      const val = await this._load();
      return val[key];
    }

    async set(key, value) {
      const val = await this._load();
      val[key] = value;
      await storage.set(this._prefix, val);
      return this;
    }

    async delete(key) {
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
