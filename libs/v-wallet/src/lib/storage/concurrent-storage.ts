import mutexifyPromise from 'mutexify/promise';
import { type AbstractStorage } from './storage';

/**
 * Storage proxy that wraps all methods in a mutex to prevent concurrent access
 * to the underlying storage. It also provides a transaction method to run
 * multiple operations in a single mutex lock.
 *
 * @param {StorageLocalMap} storage
 * @returns {StorageLocalMap}
 */
export class ConcurrentStorage<T = unknown> {
  private _storage: AbstractStorage<T>;
  private _lock: ReturnType<typeof mutexifyPromise>;

  has: (key: string) => Promise<boolean>;
  get: (key: string) => Promise<T>;
  set: (key: string, value: T) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  clear: () => Promise<void>;
  keys: () => Promise<IterableIterator<string>>;
  values: () => Promise<IterableIterator<T>>;
  entries: () => Promise<IterableIterator<[string, T]>>;

  constructor(storage: AbstractStorage<T>) {
    this._storage = storage;
    this._lock = mutexifyPromise();

    /**
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    this.has = wrapMutexify(this._storage.has.bind(this._storage));

    /**
     * @param {string} key
     * @returns {Promise<any>}
     */
    this.get = wrapMutexify(this._storage.get.bind(this._storage));

    /**
     * @param {string} key
     * @param {any} value
     * @returns {Promise<this>}
     */
    this.set = wrapMutexify(this._storage.set.bind(this._storage));

    /**
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    this.delete = wrapMutexify(this._storage.delete.bind(this._storage));

    /**
     * @returns {Promise<void>}
     */
    this.clear = wrapMutexify(this._storage.clear.bind(this._storage));

    /**
     * @returns {Promise<IterableIterator<string>}
     */
    this.keys = wrapMutexify(this._storage.keys.bind(this._storage));

    /**
     * @returns {Promise<IterableIterator<any>}
     */
    this.values = wrapMutexify(this._storage.values.bind(this._storage));

    /**
     * @returns {Promise<IterableIterator<[string, any]>}
     */
    this.entries = wrapMutexify(this._storage.entries.bind(this._storage));

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function wrapMutexify(fn: (...args: any[]) => Promise<any>) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async (...args: any[]) => {
        const release = await self._lock();
        try {
          return await fn(...args);
        } finally {
          release();
        }
      };
    }
  }

  /**
   * @param {function(StorageLocalMap): Promise<any>} fn
   * @returns {Promise<any>}
   * @throws {Error} if fn throws
   * @throws {Error} if lock is already acquired
   */
  async transaction<S>(fn: (storage: AbstractStorage<T>) => Promise<S>) {
    const release = await this._lock();
    try {
      return await fn(this._storage);
    } finally {
      release();
    }
  }
}
