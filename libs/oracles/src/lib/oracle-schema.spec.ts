import { renderHook, waitFor } from '@testing-library/react';
import { useOracleProofs, cache, invalidateCache } from './use-oracle-proofs';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

const createOracleData = () => {
  return [
    {
      name: 'Another oracle',
      url: 'https://zombo.com',
      description_markdown:
        'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
      oracle: {
        status: 'GOOD',
        status_reason: '',
        first_verified: '2022-01-01T00:00:00.000Z',
        last_verified: '2022-12-31T00:00:00.000Z',
        type: 'public_key',
        public_key:
          '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
      },
      proofs: [
        {
          format: 'url',
          available: true,
          type: 'twitter',
          url: 'https://twitter.com/vegaprotocol/status/956833487230730241',
        },
        {
          format: 'url',
          available: true,
          type: 'web',
          url: 'https://acme.io/proof.txt',
        },
        {
          format: 'url',
          available: true,
          type: 'github',
          url: 'https://github.com',
        },
        {
          format: 'signed_message',
          available: true,
          type: 'public_key',
          public_key:
            '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
          message: 'SOMEHEX',
        },
        {
          format: 'signed_message',
          available: true,
          type: 'eth_address',
          eth_address: '0x949AF81E51D57831AE52591d17fBcdd1014a5f52',
          message: 'SOMEHEX',
        },
      ],
      github_link:
        'https://github.com/vegaprotocol/well-known/blob/feat/add-process-script/oracle-providers/PubKey-69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f.toml',
    },
  ];
};

describe('useOracleProofs', () => {
  const url = 'https://foo.bar.com';
  const setup = (data: any) => {
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data),
      });
    });
    return renderHook(() => useOracleProofs(url));
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetches and caches', () => {
    it('fetches oracle data', async () => {
      const data = createOracleData();
      const { result } = setup(data);

      expect(result.current.data).toBe(undefined);
      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.data).toEqual(data);
        expect(result.current.error).toBe(undefined);
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // check result was cached
      expect(cache).toEqual({ [url]: data });
    });

    it('uses cached value if present', () => {
      const data = createOracleData();
      const { result } = setup(data);

      expect(result.current.data).toEqual(data);
      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);

      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });

  it('handles invalid payload', async () => {
    invalidateCache();
    const { result } = setup({ invalid: 'result' });

    expect(result.current.data).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe(undefined);
      expect(result.current.error instanceof Error).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('handles failed to fetch', async () => {
    invalidateCache();

    mockFetch.mockImplementation(() => {
      return Promise.reject(new Error('failed to fetch'));
    });

    const { result } = renderHook(() => useOracleProofs(url));

    expect(result.current.data).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe(undefined);
      expect(result.current.error instanceof Error).toBe(true);
      expect(result.current.error).toEqual(new Error('failed to fetch'));
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
