import RW from 'read-write-mutexify';

/**
 * A simple read-write lock, wrapping the `read-write-lock` module.
 * This class however exposes a transactional API, aiding in lock cleanup in case errors are thrown.
 */
export class RWLock {
  constructor() {
    this._lock = new RW();
  }

  /**
   * Destroy the lock, releasing all locks.
   * @param {Error} [err] - The error to reject all pending locks with.
   * @returns {Promise<void>}
   * @async
   */
  /* async */ destroy(err) {
    return this._lock.destroy(err);
  }

  /**
   * Acquire a write lock and execute the given function.
   * @param {Function} fn - The function to execute.
   * @returns {Promise<any>} - The result of the function.
   * @async
   */
  async write(fn) {
    try {
      await this._lock.write.lock();
      return await fn();
    } finally {
      this._lock.write.unlock();
    }
  }

  /**
   * Acquire a read lock and execute the given function.
   * @param {Function} fn - The function to execute.
   * @returns {Promise<any>} - The result of the function.
   * @async
   */
  async read(fn) {
    try {
      await this._lock.read.lock();
      return await fn();
    } finally {
      this._lock.read.unlock();
    }
  }
}
