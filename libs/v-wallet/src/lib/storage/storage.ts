import { type SyncMapLikeStorage, type MapLikeStorage } from '../utils';
import { localStorageWrapped } from './local-storage';

export class AbstractStorage<T = unknown> {
  _prefix: string;
  storage:
    | MapLikeStorage<Record<string, T>>
    | SyncMapLikeStorage<Record<string, T>>;

  // Scary name
  async permanentClearAll() {
    return this.storage.clear();
  }

  constructor(
    prefix: string,
    storage:
      | MapLikeStorage<Record<string, T>>
      | SyncMapLikeStorage<Record<string, T>>
  ) {
    this._prefix = prefix;
    if (storage == null) {
      throw new Error('Unsupported storage runtime');
    }
    this.storage = storage;
  }

  async _load(): Promise<Record<string, T>> {
    const res = await this.storage.get(this._prefix);
    const resp = res ?? {};
    return resp as Record<string, T>;
  }

  async has(key: string) {
    return (await this._load())[key] !== undefined;
  }

  async get(key: string) {
    const val = await this._load();
    return val[key];
  }

  async set(key: string, value: T) {
    const val = await this._load();
    val[key] = value;
    await this.storage.set(this._prefix, val);
  }

  async delete(key: string) {
    const val = await this._load();
    const hadKey = val[key] != null;
    if (hadKey) {
      delete val[key];
      await this.storage.set(this._prefix, val);
    }
    return hadKey;
  }

  async clear() {
    await this.storage.delete(this._prefix);
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
}

export function createLocalStorage<T = unknown>(name: string) {
  return new AbstractStorage<T>(name, localStorageWrapped);
}

export function createSessionStorage<T = unknown>(name: string) {
  return new AbstractStorage<T>(name, new Map());
}
