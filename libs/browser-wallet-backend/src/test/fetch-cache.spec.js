import { FetchCache, vegaCachingStrategy } from '../src/fetch-cache.js';

describe('vegaCachingStrategy', () => {
  // Add new endpoints here to ensure they are cached by the test suite
  it('should cache assets', () => {
    expect(vegaCachingStrategy('/api/v2/assets')).toBeGreaterThan(0);
  });

  it('should cache markets', () => {
    expect(vegaCachingStrategy('/api/v2/markets')).toBeGreaterThan(0);
  });

  it('should not cache other endpoints', () => {
    expect(vegaCachingStrategy('/api/v2/accounts')).toBe(0);
  });
});

describe('FetchCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should cache values', async () => {
    const cache = new FetchCache(new Map(), () => 1000);

    await cache.set('foo', 'test', 'bar');

    expect(await cache.get('foo', 'test')).toBe('bar');

    jest.advanceTimersByTime(1001);

    expect(await cache.get('foo', 'test')).toBeUndefined();
    expect(await cache.has('foo', 'test')).toBe(false);

    const dummyAssetResponse = {
      assets: {
        edges: [
          {
            node: {
              id: 'd1984e3d365faa05bcafbe41f50f90e3663ee7c0da22bb1e24b164e9532691b2',
              details: {
                name: 'VEGA',
                symbol: 'VEGA',
                decimals: '18',
                quantum: '1000000000000000000',
                erc20: {
                  contractAddress: '0xcB84d72e61e383767C4DFEb2d8ff7f4FB89abc6e',
                  lifetimeLimit: '0',
                  withdrawThreshold: '0',
                },
              },
              status: 'STATUS_ENABLED',
            },
            cursor:
              'eyJpZCI6ImQxOTg0ZTNkMzY1ZmFhMDViY2FmYmU0MWY1MGY5MGUzNjYzZWU3YzBkYTIyYmIxZTI0YjE2NGU5NTMyNjkxYjIifQ==',
          },
          {
            node: {
              id: 'bf1e88d19db4b3ca0d1d5bdb73718a01686b18cf731ca26adedf3c8b83802bba',
              details: {
                name: 'Tether USD',
                symbol: 'USDT',
                decimals: '6',
                quantum: '1000000',
                erc20: {
                  contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                  lifetimeLimit: '10000000000',
                  withdrawThreshold: '1',
                },
              },
              status: 'STATUS_ENABLED',
            },
            cursor:
              'eyJpZCI6ImJmMWU4OGQxOWRiNGIzY2EwZDFkNWJkYjczNzE4YTAxNjg2YjE4Y2Y3MzFjYTI2YWRlZGYzYzhiODM4MDJiYmEifQ==',
          },
          {
            node: {
              id: 'a4a16e250a09a86061ec83c2f9466fc9dc33d332f86876ee74b6f128a5cd6710',
              details: {
                name: 'USD Coin',
                symbol: 'USDC',
                decimals: '6',
                quantum: '1000000',
                erc20: {
                  contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                  lifetimeLimit: '10000000000',
                  withdrawThreshold: '1',
                },
              },
              status: 'STATUS_ENABLED',
            },
            cursor:
              'eyJpZCI6ImE0YTE2ZTI1MGEwOWE4NjA2MWVjODNjMmY5NDY2ZmM5ZGMzM2QzMzJmODY4NzZlZTc0YjZmMTI4YTVjZDY3MTAifQ==',
          },
          {
            node: {
              id: '476196e453f9eccde93381bd5043f5f68ba96955f553ceea6f7611cc5785e958',
              details: {
                name: 'Wrapped Ether',
                symbol: 'WETH',
                decimals: '18',
                quantum: '500000000000000',
                erc20: {
                  contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                  lifetimeLimit: '5000000000000000000',
                  withdrawThreshold: '1',
                },
              },
              status: 'STATUS_ENABLED',
            },
            cursor:
              'eyJpZCI6IjQ3NjE5NmU0NTNmOWVjY2RlOTMzODFiZDUwNDNmNWY2OGJhOTY5NTVmNTUzY2VlYTZmNzYxMWNjNTc4NWU5NTgifQ==',
          },
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor:
            'eyJpZCI6ImQxOTg0ZTNkMzY1ZmFhMDViY2FmYmU0MWY1MGY5MGUzNjYzZWU3YzBkYTIyYmIxZTI0YjE2NGU5NTMyNjkxYjIifQ==',
          endCursor:
            'eyJpZCI6IjQ3NjE5NmU0NTNmOWVjY2RlOTMzODFiZDUwNDNmNWY2OGJhOTY5NTVmNTUzY2VlYTZmNzYxMWNjNTc4NWU5NTgifQ==',
        },
      },
    };
    await cache.set('/api/v2/assets', 'test', dummyAssetResponse);

    expect(await cache.get('/api/v2/assets', 'test')).toEqual(
      dummyAssetResponse
    );
  });

  it('should not cache values with a TTL of 0', async () => {
    const cache = new FetchCache(new Map(), () => 0);

    await cache.set('foo', 'test', 'bar');

    expect(await cache.get('foo', 'test')).toBeUndefined();
    expect(await cache.has('foo', 'test')).toBe(false);
  });

  it('should refresh the ttl when setting again', async () => {
    const cache = new FetchCache(new Map(), () => 1000);

    await cache.set('foo', 'test', 'bar');
    expect(await cache.get('foo', 'test')).toBe('bar');

    jest.advanceTimersByTime(500);
    await cache.set('foo', 'test', 'bar');

    jest.advanceTimersByTime(750);

    expect(await cache.get('foo', 'test')).toBe('bar');
    expect(await cache.has('foo', 'test')).toBe(true);
  });

  it('should not normalize urls when using the default ttlFn', async () => {
    const cache = new FetchCache(new Map());

    await cache.set('/api/v2/assets?1', 'test', 1);
    await cache.set('/api/v2/assets?2', 'test', 2);

    expect(await cache.get('/api/v2/assets?1', 'test')).toBe(1);
    expect(await cache.get('/api/v2/assets?2', 'test')).toBe(2);
    expect(await cache.get('/api/v2/assets', 'test')).toBeUndefined();

    await cache.set('/api/v2/assets?a=1&b=2', 'test', 3);
    await cache.set('/api/v2/assets?b=2&a=1', 'test', 4);

    expect(await cache.get('/api/v2/assets?a=1&b=2', 'test')).toBe(3);
    expect(await cache.get('/api/v2/assets?b=2&a=1', 'test')).toBe(4);
    expect(await cache.get('/api/v2/assets', 'test')).toBeUndefined();
  });
});
