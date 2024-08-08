import { /* StorageSessionMap, */ StorageLocalMap } from '../lib/storage.js';

// describe('StorageSessionMap', () => {
//   it('should not be supported in Node.js', () => {
//     expect(() => new StorageSessionMap('test')).toThrow();
//     expect(StorageSessionMap.isSupported()).toBe(false);
//   });
// });

describe('StorageLocalMap', () => {
  beforeEach(() => {
    StorageLocalMap.permanentClearAll();
  });

  it('should support Map-like APIs, but async', async () => {
    const storage = new StorageLocalMap('test');

    expect(await storage.has('test')).toBe(false);
    expect(await storage.get('test')).toBe(undefined);
    expect(await storage.keys()).toEqual([]);
    expect(await storage.values()).toEqual([]);
    expect(await storage.entries()).toEqual([]);
    expect(await storage.delete('test')).toBe(false);
    expect(await storage.clear()).toBe(undefined);

    expect(await storage.set('K', 'V')).toBe(storage);
    expect(await storage.has('K')).toBe(true);
    expect(await storage.get('K')).toBe('V');
    expect(await storage.keys()).toEqual(['K']);
    expect(await storage.values()).toEqual(['V']);
    expect(await storage.entries()).toEqual([['K', 'V']]);
    expect(await storage.delete('K')).toBe(true);
    expect(await storage.has('K')).toBe(false);
    expect(await storage.get('K')).toBe(undefined);
    expect(await storage.keys()).toEqual([]);
    expect(await storage.values()).toEqual([]);
    expect(await storage.entries()).toEqual([]);
    expect(await storage.clear()).toBe(undefined);
  });

  it('should separate different prefixes', async () => {
    const s1 = new StorageLocalMap('test1');
    const s2 = new StorageLocalMap('test2');

    expect(await s1.has('test')).toBe(false);
    expect(await s2.has('test')).toBe(false);

    expect(await s1.set('K1', 'V1')).toBe(s1);
    expect(await s2.set('K2', 'V2')).toBe(s2);

    expect(await s1.has('K1')).toBe(true);
    expect(await s1.has('K2')).toBe(false);
    expect(await s2.has('K1')).toBe(false);
    expect(await s2.has('K2')).toBe(true);

    expect(await s1.get('K1')).toBe('V1');
    expect(await s2.get('K2')).toBe('V2');

    expect(await s1.keys()).toEqual(['K1']);
    expect(await s2.keys()).toEqual(['K2']);

    expect(await s1.values()).toEqual(['V1']);
    expect(await s2.values()).toEqual(['V2']);

    expect(await s1.entries()).toEqual([['K1', 'V1']]);
    expect(await s2.entries()).toEqual([['K2', 'V2']]);

    expect(await s1.delete('K1')).toBe(true);

    expect(await s1.has('K1')).toBe(false);
    expect(await s1.has('K2')).toBe(false);
    expect(await s2.has('K1')).toBe(false);
    expect(await s2.has('K2')).toBe(true);

    expect(await s1.set('K2', 'V1')).toBe(s1);

    expect(await s1.has('K2')).toBe(true);

    expect(await s1.get('K2')).toBe('V1');
    expect(await s2.get('K2')).toBe('V2');

    expect(await s2.clear()).toBe(undefined);
    expect(await s1.has('K2')).toBe(true);

    StorageLocalMap.permanentClearAll();

    expect(await s1.has('K2')).toBe(false);
    expect(await s2.has('K2')).toBe(false);
  });
});
