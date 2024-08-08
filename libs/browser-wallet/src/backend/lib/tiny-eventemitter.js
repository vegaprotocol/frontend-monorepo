import { KeyedSet } from './keyed-set.js'

export class TinyEventemitter {
  constructor() {
    this._listeners = new KeyedSet()
  }

  /**
   * Adds a listener for the given event name.
   *
   * @param {string} name
   * @param {function} listener
   * @returns {function} A function that removes the listener.
   */
  on(name, listener) {
    this._listeners.add(name, listener)

    return () => {
      this.off(name, listener)
    }
  }

  /**
   * Removes a listener for the given event name. Omits the listener to remove
   * all listeners for the given event name.
   *
   * @param {string} name
   * @param {function} [listener]
   * @returns {boolean} Whether a listener was removed.
   */
  off(name, listener) {
    return this._listeners.delete(name, listener)
  }

  /**
   * Emits an event with the given name and arguments.
   *
   * @param {string} name
   * @param {...any} args
   */
  emit(name, ...args) {
    const listeners = this._listeners.get(name) || []
    for (const listener of listeners) {
      try {
        listener(...args)
      } catch (err) {}
    }
  }
}
