import ConcurrentStorage from '../lib/concurrent-storage.js';

describe('concurrent-storage', () => {
  test('get() returns undefined for missing keys', async () => {
    const storage = new Map();
    const concurrentStorage = new ConcurrentStorage(storage);

    await concurrentStorage.transaction(async (store) => {
      expect(await store.get('foo')).toBe(undefined);
    });
  });

  test('get() returns the value for existing keys', async () => {
    const storage = new Map();
    const concurrentStorage = new ConcurrentStorage(storage);

    await concurrentStorage.transaction(async (store) => {
      await store.set('foo', 'bar');

      expect(await store.get('foo')).toBe('bar');
    });

    expect(await concurrentStorage.get('foo')).toBe('bar');
  });

  test('get() returns the value for existing keys on nested storage', async () => {
    const storage = new Map();
    const c1 = new ConcurrentStorage(storage);
    const c2 = new ConcurrentStorage(c1);

    await c2.transaction(async (store) => {
      expect(await store.get('foo')).toBe(undefined);

      await store.set('foo', 'bar');
    });

    expect(await c2.get('foo')).toBe('bar');
    expect(await c1.get('foo')).toBe('bar');
  });
});
