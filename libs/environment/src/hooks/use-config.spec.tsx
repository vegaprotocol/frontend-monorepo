import { renderHook } from '@testing-library/react-hooks';
import { Networks } from '@vegaprotocol/react-helpers';
import type { EnvironmentWithOptionalUrl } from './use-config';
import { useConfig, LOCAL_STORAGE_NETWORK_KEY } from './use-config';

type HostMapping = Record<string, number | Error>;

const mockHostsMap: HostMapping = {
  'https://host1.com': 300,
  'https://host2.com': 500,
  'https://host3.com': 100,
  'https://host4.com': 650,
};

const hostList = Object.keys(mockHostsMap);

const mockEnvironment: EnvironmentWithOptionalUrl = {
  VEGA_ENV: Networks.TESTNET,
  VEGA_CONFIG_URL: 'https://vega.url/config.json',
  VEGA_NETWORKS: {},
  ETHEREUM_CHAIN_ID: 1,
  ETHEREUM_PROVIDER_URL: 'https://ethereum.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  ADDRESSES: {
    vegaTokenAddress: '0x0',
    claimAddress: '0x0',
    lockedAddress: '0x0',
  },
};

function setupFetch(configUrl: string, hostMap: HostMapping) {
  const hostUrls = Object.keys(hostMap);
  return (url: RequestInfo) => {
    if (url === configUrl) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hosts: hostUrls }),
      } as Response);
    }

    if (hostUrls.includes(url as string)) {
      const value = hostMap[url as string];
      return new Promise<Response>((resolve, reject) => {
        if (typeof value === 'number') {
          setTimeout(() => {
            resolve({ ok: true } as Response);
          }, value);
        } else {
          reject(value);
        }
      });
    }

    return Promise.resolve({
      ok: true,
    } as Response);
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

global.fetch = jest.fn();

const mockUpdate = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  mockUpdate.mockClear();
  window.localStorage.clear();

  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockReset();
  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockImplementation(
    setupFetch(mockEnvironment.VEGA_CONFIG_URL, mockHostsMap)
  );
});

afterAll(() => {
  // @ts-ignore: typescript doesn't recognise the mocked fetch instance
  fetch.mockRestore();
});

describe('useConfig hook', () => {
  it('has an initial success state when the environment already has a URL', async () => {
    const mockEnvWithUrl = {
      ...mockEnvironment,
      VEGA_URL: 'https://some.url/query',
    };
    const { result } = renderHook(() => useConfig(mockEnvWithUrl, mockUpdate));

    expect(fetch).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(result.current.status).toBe('success');
  });

  it('updates the environment with a host url from the network configuration', async () => {
    const allowedStatuses = [
      'idle',
      'loading-config',
      'loading-node',
      'success',
    ];

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, mockUpdate)
    );

    await waitForNextUpdate();
    jest.runAllTimers();
    await waitForNextUpdate();

    expect(result.current.status).toBe('success');
    result.all.forEach((state) => {
      expect(allowedStatuses).toContain('status' in state && state.status);
    });

    // fetches config
    expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
    // calls each node
    hostList.forEach((url) => {
      expect(fetch).toHaveBeenCalledWith(url);
    });

    // updates the environment
    expect(hostList).toContain(mockUpdate.mock.calls[0][0]({}).VEGA_URL);
  });

  it('uses the host from the configuration which responds first', async () => {
    const shortestResponseTime = Object.values(mockHostsMap).sort()[0];
    const expectedHost = hostList.find((url: keyof typeof mockHostsMap) => {
      return mockHostsMap[url] === shortestResponseTime;
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, mockUpdate)
    );

    await waitForNextUpdate();
    jest.runAllTimers();
    await waitForNextUpdate();

    expect(result.current.status).toBe('success');
    expect(mockUpdate.mock.calls[0][0]({}).VEGA_URL).toBe(expectedHost);
  });

  it('ignores failing hosts and uses one which returns a success response', async () => {
    const mockHostsMapScoped = {
      'https://host1.com': 350,
      'https://host2.com': new Error('Server error'),
      'https://host3.com': 230,
      'https://host4.com': new Error('Server error'),
    };

    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation(
      setupFetch(mockEnvironment.VEGA_CONFIG_URL, mockHostsMapScoped)
    );

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, mockUpdate)
    );

    await waitForNextUpdate();
    jest.runAllTimers();
    await waitForNextUpdate();

    expect(result.current.status).toBe('success');
    expect(mockUpdate.mock.calls[0][0]({}).VEGA_URL).toBe('https://host3.com');
  });

  it('returns the correct error status for when the config cannot be accessed', async () => {
    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation((url: RequestInfo) => {
      if (url === mockEnvironment.VEGA_CONFIG_URL) {
        return Promise.reject(new Error('Server error'));
      }
      return Promise.resolve({ ok: true } as Response);
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, mockUpdate)
    );

    await waitForNextUpdate();

    expect(result.current.status).toBe('error-loading-config');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns the correct error status for when the config is not valid', async () => {
    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation((url: RequestInfo) => {
      if (url === mockEnvironment.VEGA_CONFIG_URL) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ some: 'data' }),
        });
      }
      return Promise.resolve({ ok: true } as Response);
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, mockUpdate)
    );

    await waitForNextUpdate();

    expect(result.current.status).toBe('error-validating-config');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns the correct error status for when no hosts can be accessed', async () => {
    const mockHostsMapScoped = {
      'https://host1.com': new Error('Server error'),
      'https://host2.com': new Error('Server error'),
      'https://host3.com': new Error('Server error'),
      'https://host4.com': new Error('Server error'),
    };

    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation(
      setupFetch(mockEnvironment.VEGA_CONFIG_URL, mockHostsMapScoped)
    );

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, mockUpdate)
    );

    await waitForNextUpdate();

    expect(result.current.status).toBe('error-loading-node');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('caches the list of networks', async () => {
    const run1 = renderHook(() => useConfig(mockEnvironment, mockUpdate));

    await run1.waitForNextUpdate();
    jest.runAllTimers();
    await run1.waitForNextUpdate();

    expect(run1.result.current.status).toBe('success');
    expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);

    // @ts-ignore typescript doesn't recognise the mocked instance
    fetch.mockClear();

    const run2 = renderHook(() => useConfig(mockEnvironment, mockUpdate));

    jest.runAllTimers();
    await run2.waitForNextUpdate();

    expect(run2.result.current.status).toBe('success');
    expect(fetch).not.toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  });

  it('caches the list of networks between runs', async () => {
    const run1 = renderHook(() => useConfig(mockEnvironment, mockUpdate));

    await run1.waitForNextUpdate();
    jest.runAllTimers();
    await run1.waitForNextUpdate();

    expect(run1.result.current.status).toBe('success');
    expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);

    // @ts-ignore typescript doesn't recognise the mocked instance
    fetch.mockClear();

    const run2 = renderHook(() => useConfig(mockEnvironment, mockUpdate));

    jest.runAllTimers();
    await run2.waitForNextUpdate();

    expect(run2.result.current.status).toBe('success');
    expect(fetch).not.toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  });

  it('refetches the network configuration and resets the cache when malformed data found in the storage', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_NETWORK_KEY, '{not:{valid:{json');
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(noop);

    const run1 = renderHook(() => useConfig(mockEnvironment, mockUpdate));

    await run1.waitForNextUpdate();
    jest.runAllTimers();
    await run1.waitForNextUpdate();

    expect(run1.result.current.status).toBe('success');
    expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('refetches the network configuration and resets the cache when invalid data found in the storage', async () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_NETWORK_KEY,
      JSON.stringify({ invalid: 'data' })
    );
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(noop);

    const run1 = renderHook(() => useConfig(mockEnvironment, mockUpdate));

    await run1.waitForNextUpdate();
    jest.runAllTimers();
    await run1.waitForNextUpdate();

    expect(run1.result.current.status).toBe('success');
    expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
