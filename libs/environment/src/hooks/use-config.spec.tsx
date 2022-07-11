import { act, renderHook } from '@testing-library/react-hooks';
import type { EnvironmentWithOptionalUrl } from './use-config';
import { useConfig, LOCAL_STORAGE_NETWORK_KEY } from './use-config';
import createClient from '../utils/apollo-client';
import createMockClient, { MockRequestConfig } from './mocks/apollo-client';
import { Networks } from '../types';

jest.mock('../utils/apollo-client');

type HostMapping = Record<string, {
  query?: MockRequestConfig,
  subscription?: MockRequestConfig,
}>;

const mockHostMap: HostMapping = {
  'https://host1.com': {
    query: {
      delay: 300,
    },
  },
  'https://host2.com': {
    query: {
      delay: 500,
    },
  },
  'https://host3.com': {
    query: {
      delay: 100,
    },
  },
  'https://host4.com': {
    query: {
      delay: 650,
    },
  },
};

const getQuickestHost = (hostMap: HostMapping) => {
  return Object.keys(hostMap).sort((host1, host2) =>
    (hostMap[host1].query?.delay ?? 0) - (hostMap[host2].query?.delay ?? 0)
  )[0];
}

const mockEnvironment: EnvironmentWithOptionalUrl = {
  VEGA_ENV: Networks.TESTNET,
  VEGA_CONFIG_URL: 'https://vega.url/config.json',
  VEGA_NETWORKS: {},
  ETHEREUM_PROVIDER_URL: 'https://ethereum.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  GIT_BRANCH: 'test',
  GIT_ORIGIN_URL: 'https://github.com/test/repo',
  GIT_COMMIT_HASH: 'abcde01234',
  GITHUB_FEEDBACK_URL: 'https://github.com/test/feedback',
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

    return Promise.resolve({
      ok: true,
    } as Response);
  };
}

global.fetch = jest.fn();

const onUpdate = jest.fn();
const onError = jest.fn();

beforeAll(() => {
  jest.useFakeTimers();
});

beforeEach(() => {
  onUpdate.mockClear();
  onError.mockClear();
  window.localStorage.clear();

  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockReset();
  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockImplementation(
    setupFetch(mockEnvironment.VEGA_CONFIG_URL ?? '', mockHostMap)
  );

  // @ts-ignore allow adding a mock return value to mocked module
  createClient.mockImplementation(baseUrl => createMockClient({
    ...mockHostMap[baseUrl],
    network: mockEnvironment.VEGA_ENV,
  }));
});

afterAll(() => {
  // @ts-ignore: typescript doesn't recognise the mocked fetch instance
  fetch.mockRestore();
});

const flushPromises = async () => {
  for (let i = 100; i > 0; i--) { // Hope this arbitrary number is enough!
    await null;
  }
};

describe('useConfig hook', () => {
  it('sets config for environment with VEGA_URL', async () => {
    const mockEnvWithUrl = {
      ...mockEnvironment,
      VEGA_URL: Object.keys(mockHostMap)[0],
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvWithUrl, onUpdate, onError)
    );

    await waitForNextUpdate();

    expect(result.current.config).toEqual({ hosts: Object.keys(mockHostMap) });
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it.only('sets config for environment without VEGA_URL and updates environment with the node completing validation first', async () => {
    const mockEnvWithUrl = {
      ...mockEnvironment,
      VEGA_URL: undefined,
    };
    const { result, waitFor } = renderHook(() =>
      useConfig(mockEnvWithUrl, onUpdate, onError)
    );

    act(() => {
      jest.runAllTimers();
    })


    await flushPromises();

    await waitFor(() => {
      expect(result.current.config).toEqual({ hosts: Object.keys(mockHostMap) });
      expect(onUpdate).toHaveBeenCalledWith({
        ...mockEnvironment,
        VEGA_URL: getQuickestHost(mockHostMap),
      });
      expect(onError).not.toHaveBeenCalled();
    });
  });

  it('returns an unset config when no config url is provided', async () => {
    const mockEnvWithUrl = {
      ...mockEnvironment,
      VEGA_CONFIG_URL: undefined,
    };
    const { result } = renderHook(() =>
      useConfig(mockEnvWithUrl, onUpdate, onError)
    );

    expect(result.error).toBe(undefined);
    expect(result.current.config).toBe(undefined);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('does not call the error callback when the provided VEGA_URL passes the node validation', async () => {
    const mockEnvWithUrl = {
      ...mockEnvironment,
      VEGA_CONFIG_URL: undefined,
      VEGA_URL: Object.keys(mockHostMap)[0],
    };
    const { result } = renderHook(() =>
      useConfig(mockEnvWithUrl, onUpdate, onError)
    );

    expect(result.error).toBe(undefined);
    expect(result.current.config).toBe(undefined);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  // it('updates the VEGA_ENV ', async () => {
  //   const mockEnvWithUrl = {
  //     ...mockEnvironment,
  //     VEGA_URL: Object.keys(mockHostMap)[0],
  //   };
  //   const { result } = renderHook(() =>
  //     useConfig(mockEnvWithUrl, onUpdate, onError)
  //   );
  //
  //   expect(result.error).toBe(undefined);
  //   expect(result.current.config).toBe(undefined);
  //   expect(onUpdate).not.toHaveBeenCalled();
  //   expect(onError).not.toHaveBeenCalled();
  // });

  //
  // it('updates the environment with a host url from the network configuration', async () => {
  //   const allowedStatuses = [
  //     'idle',
  //     'loading-config',
  //     'loading-node',
  //     'success',
  //   ];
  //
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await waitForNextUpdate();
  //   jest.runAllTimers();
  //   await waitForNextUpdate();
  //
  //   // fetches config
  //   expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  //   // calls each node
  //   hostList.forEach((url) => {
  //     expect(fetch).toHaveBeenCalledWith(url);
  //   });
  //
  //   // updates the environment
  //   expect(hostList).toContain(onUpdate.mock.calls[0][0]({}).VEGA_URL);
  // });
  //
  // it('uses the host from the configuration which responds first', async () => {
  //   const shortestResponseTime = Object.values(mockHostMap).sort()[0];
  //   const expectedHost = hostList.find((url: keyof typeof mockHostMap) => {
  //     return mockHostMap[url] === shortestResponseTime;
  //   });
  //
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await waitForNextUpdate();
  //   jest.runAllTimers();
  //   await waitForNextUpdate();
  //
  //   expect(onUpdate.mock.calls[0][0]({}).VEGA_URL).toBe(expectedHost);
  // });
  //
  // it('ignores failing hosts and uses one which returns a success response', async () => {
  //   const mockHostMapScoped = {
  //     'https://host1.com': {
  //       query: {
  //         delay: 350,
  //       }
  //     },
  //     'https://host2.com': {
  //       query: {
  //         hasError: true,
  //       },
  //     },
  //     'https://host3.com': {
  //       query: {
  //         delay: 230,
  //       },
  //     },
  //     'https://host4.com': {
  //       query: {
  //         hasError: true,
  //       }
  //     },
  //   };
  //
  //   // @ts-ignore typescript doesn't recognise the mocked instance
  //   global.fetch.mockImplementation(
  //     setupFetch(mockEnvironment.VEGA_CONFIG_URL ?? '', mockHostMapScoped)
  //   );
  //
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await waitForNextUpdate();
  //   jest.runAllTimers();
  //   await waitForNextUpdate();
  //
  //   expect(onUpdate.mock.calls[0][0]({}).VEGA_URL).toBe('https://host3.com');
  // });
  //
  // it('returns the correct error status for when the config cannot be accessed', async () => {
  //   // @ts-ignore typescript doesn't recognise the mocked instance
  //   global.fetch.mockImplementation((url: RequestInfo) => {
  //     if (url === mockEnvironment.VEGA_CONFIG_URL) {
  //       return Promise.reject(new Error('Server error'));
  //     }
  //     return Promise.resolve({ ok: true } as Response);
  //   });
  //
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await waitForNextUpdate();
  //
  //   expect(onUpdate).not.toHaveBeenCalled();
  // });
  //
  // it('returns the correct error status for when the config is not valid', async () => {
  //   // @ts-ignore typescript doesn't recognise the mocked instance
  //   global.fetch.mockImplementation((url: RequestInfo) => {
  //     if (url === mockEnvironment.VEGA_CONFIG_URL) {
  //       return Promise.resolve({
  //         ok: true,
  //         json: () => Promise.resolve({ some: 'data' }),
  //       });
  //     }
  //     return Promise.resolve({ ok: true } as Response);
  //   });
  //
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await waitForNextUpdate();
  //
  //   expect(onUpdate).not.toHaveBeenCalled();
  // });
  //
  // it('returns the correct error status for when no hosts can be accessed', async () => {
  //   const mockHostMapScoped = {
  //     'https://host1.com': {
  //       query: {
  //         hasError: true,
  //       },
  //     },
  //     'https://host2.com': {
  //       query: {
  //         hasError: true,
  //       },
  //     },
  //     'https://host3.com': {
  //       query: {
  //         hasError: true,
  //       },
  //     },
  //     'https://host4.com': {
  //       query: {
  //         hasError: true,
  //       },
  //     },
  //   };
  //
  //   // @ts-ignore typescript doesn't recognise the mocked instance
  //   global.fetch.mockImplementation(
  //     setupFetch(mockEnvironment.VEGA_CONFIG_URL ?? '', mockHostMapScoped)
  //   );
  //
  //   const { result, waitForNextUpdate } = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await waitForNextUpdate();
  //
  //   expect(onUpdate).not.toHaveBeenCalled();
  // });
  //
  // it('caches the list of networks', async () => {
  //   const run1 = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await run1.waitForNextUpdate();
  //   jest.runAllTimers();
  //   await run1.waitForNextUpdate();
  //
  //   expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  //
  //   // @ts-ignore typescript doesn't recognise the mocked instance
  //   fetch.mockClear();
  //
  //   const run2 = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   jest.runAllTimers();
  //   await run2.waitForNextUpdate();
  //
  //   expect(fetch).not.toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  // });
  //
  // it('caches the list of networks between runs', async () => {
  //   const run1 = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await run1.waitForNextUpdate();
  //   jest.runAllTimers();
  //   await run1.waitForNextUpdate();
  //
  //   expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  //
  //   // @ts-ignore typescript doesn't recognise the mocked instance
  //   fetch.mockClear();
  //
  //   const run2 = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   jest.runAllTimers();
  //   await run2.waitForNextUpdate();
  //
  //   expect(fetch).not.toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  // });
  //
  // it('refetches the network configuration and resets the cache when malformed data found in the storage', async () => {
  //   window.localStorage.setItem(LOCAL_STORAGE_NETWORK_KEY, '{not:{valid:{json');
  //   const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(noop);
  //
  //   const run1 = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await run1.waitForNextUpdate();
  //   jest.runAllTimers();
  //   await run1.waitForNextUpdate();
  //
  //   expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  //   expect(consoleWarnSpy).toHaveBeenCalled();
  //
  //   consoleWarnSpy.mockRestore();
  // });
  //
  // it('refetches the network configuration and resets the cache when invalid data found in the storage', async () => {
  //   window.localStorage.setItem(
  //     LOCAL_STORAGE_NETWORK_KEY,
  //     JSON.stringify({ invalid: 'data' })
  //   );
  //   const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(noop);
  //
  //   const run1 = renderHook(() =>
  //     useConfig(mockEnvironment, onUpdate, onError)
  //   );
  //
  //   await run1.waitForNextUpdate();
  //   jest.runAllTimers();
  //   await run1.waitForNextUpdate();
  //
  //   expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
  //   expect(consoleSpy).toHaveBeenCalled();
  //
  //   consoleSpy.mockRestore();
  // });
});
