import mutexifyPromise from 'mutexify/promise';
/**
 * Storage proxy that wraps all methods in a mutex to prevent concurrent access
 * to the underlying storage. It also provides a transaction method to run
 * multiple operations in a single mutex lock.
 *
 * @param {StorageLocalMap} storage
 * @returns {StorageLocalMap}
 */
class ConcurrentStorage {
  /**
   * @type {function(): Promise<() => void>}
   */
  _lock;

  constructor(storage) {
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
    function wrapMutexify(fn) {
      return async (...args) => {
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
  async transaction(fn) {
    const release = await this._lock();
    try {
      return await fn(this._storage);
    } finally {
      release();
    }
  }
}

export default ConcurrentStorage;
