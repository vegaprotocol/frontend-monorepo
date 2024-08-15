import { KeyedSet } from './keyed-set';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Listener = (...args: any[]) => void;

export class TinyEventemitter {
  private _listeners: KeyedSet<Listener>;
  constructor() {
    this._listeners = new KeyedSet();
  }

  /**
   * Adds a listener for the given event name.
   *
   * @param {string} name
   * @param {function} listener
   * @returns {function} A function that removes the listener.
   */
  on(name: string, listener: Listener) {
    this._listeners.add(name, listener);

    return () => {
      this.off(name, listener);
    };
  }

  /**
   * Removes a listener for the given event name. Omits the listener to remove
   * all listeners for the given event name.
   *
   * @param {string} name
   * @param {function} [listener]
   * @returns {boolean} Whether a listener was removed.
   */
  off(name: string, listener: Listener) {
    return this._listeners.delete(name, listener);
  }

  /**
   * Emits an event with the given name and arguments.
   *
   * @param {string} name
   * @param {...any} args
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(name: string, ...args: any[]) {
    const listeners = this._listeners.get(name) || [];
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (err) {
        // NOOP
      }
    }
  }
}
