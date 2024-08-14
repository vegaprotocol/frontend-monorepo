// eslint-disable-next-line no-undef
const extensionStorage = globalThis.localStorage;

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
      const json = (await storage.getItem(this._prefix)) ?? '{}';
      return JSON.parse(json);
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
      await storage.setItem(this._prefix, JSON.stringify(val, null, '\t'));
      return this;
    }

    async delete(key) {
      const val = await this._load();
      const hadKey = val[key] != null;
      if (hadKey) {
        delete val[key];
        await storage.setItem(this._prefix, JSON.stringify(val, null, '\t'));
      }
      return hadKey;
    }

    async clear() {
      await storage.removeItem(this._prefix);
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

export class StorageLocalMap extends abstractStorage(extensionStorage) {}
export class StorageSessionMap extends abstractStorage(extensionStorage) {}
