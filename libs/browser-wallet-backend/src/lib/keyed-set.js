/**
 * A Map-like object that allows a set of values per key
 * @extends {Map}
 * @template K
 * @template V
 */
export class KeyedSet extends Map {
  /**
   * Add a value to the set at the given key
   *
   * @param {K} key
   * @param {V} value
   * @returns {this}
   */
  add(key, value) {
    const s = this.get(key);

    if (s == null) {
      this.set(key, new Set([value]));
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
  delete(key, value) {
    if (value == null) return super.delete(key);

    const s = super.get(key);
    if (s == null) return false;

    const res = s.delete(value);
    if (s.size === 0) {
      this.delete(key);
    }

    return res;
  }

  values(key) {
    if (key == null) return super.values();

    return super.get(key) ?? new Set();
  }
}
