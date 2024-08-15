/**
 * A Map-like object that allows a set of values per key
 * @extends {Map}
 * @template K
 * @template V
 */
export class KeyedSet<T = unknown> {
  private map: Map<string, Set<T>>;

  /**
   *
   */
  constructor() {
    this.map = new Map();
  }

  /**
   * Get the set of values at the given key
   * @param {K} key
   * @returns {Set<T> | undefined}
   **/
  get(key: string) {
    return this.map.get(key);
  }

  /**
   * Add a value to the set at the given key
   *
   * @param {K} key
   * @param {V} value
   * @returns {this}
   */
  add(key: string, value: T) {
    const s = this.map.get(key);

    if (s == null) {
      this.map.set(key, new Set([value]));
      return this;
    }

    s.add(value);

    return this;
  }

  /**
   * Delete a value from the set at the given key.
   * If value is null, delete the entire set.
   *
   * @param {K} key
   * @param {V} [value]
   * @returns {boolean}
   */
  delete(key: string, value: T): boolean {
    if (value == null) return this.map.delete(key);

    const s = this.map.get(key);
    if (s == null) return false;

    const res = s.delete(value);
    if (s.size === 0) {
      this.map.delete(key);
    }

    return res;
  }
}
