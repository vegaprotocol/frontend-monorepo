// having the node switcher dialog in the environment provider breaks the test renderer
// workaround based on: https://github.com/facebook/react/issues/11565
import type { ComponentProps, ReactNode } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createClient } from '@vegaprotocol/apollo-client';
import { useEnvironment, EnvironmentProvider } from './use-environment';
import { Networks, ErrorType } from '../types';
import type { MockRequestConfig } from './mocks/apollo-client';
import createMockClient from './mocks/apollo-client';
import { getErrorByType } from '../utils/validate-node';

jest.mock('@vegaprotocol/apollo-client');

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: ReactNode) => node,
}));

global.fetch = jest.fn();

const MockWrapper = (props: ComponentProps<typeof EnvironmentProvider>) => {
  return <EnvironmentProvider {...props} />;
};

const MOCK_HOST = 'https://vega.host/query';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const mockEnvironmentState = {
  VEGA_URL: 'https://vega.xyz',
  VEGA_ENV: Networks.TESTNET,
  VEGA_CONFIG_URL: 'https://vega.xyz/testnet-config.json',
  VEGA_NETWORKS: {
    TESTNET: 'https://testnet.url',
    STAGNET3: 'https://stagnet3.url',
    MAINNET: 'https://mainnet.url',
  },
  ETHEREUM_PROVIDER_URL: 'https://ether.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  GIT_BRANCH: 'test',
  GIT_ORIGIN_URL: 'https://github.com/test/repo',
  GIT_COMMIT_HASH: 'abcde01234',
  GITHUB_FEEDBACK_URL: 'https://github.com/test/feedback',
  setNodeSwitcherOpen: noop,
  networkError: undefined,
};

const MOCK_DURATION = 76;

window.performance.getEntriesByName = jest
  .fn()
  .mockImplementation((url: string) => [
    {
      entryType: 'resource',
      name: url,
      startTime: 0,
      toJSON: () => ({}),
      duration: MOCK_DURATION,
    },
  ]);

function setupFetch(
  configUrl: string = mockEnvironmentState.VEGA_CONFIG_URL,
  hosts?: string[]
) {
  return (url: RequestInfo) => {
    if (url === configUrl) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hosts: hosts || [MOCK_HOST] }),
      } as Response);
    }

    return Promise.resolve({
      ok: true,
    } as Response);
  };
}

const getQuickestNode = (mockNodes: Record<string, MockRequestConfig>) => {
  const { nodeUrl } = Object.keys(mockNodes).reduce<{
    nodeUrl?: string;
    delay: number;
  }>(
    (acc, url) => {
      const { delay = 0, hasError = false } = mockNodes[url];
      if (!hasError && delay < acc.delay) {
        return { nodeUrl: url, delay };
      }
      return acc;
    },
    { nodeUrl: undefined, delay: Infinity }
  );
  return nodeUrl;
};

beforeEach(() => {
  // @ts-ignore: typescript doesn't recognize the mock implementation
  global.fetch.mockImplementation(setupFetch());

  window.localStorage.clear();

  // @ts-ignore allow adding a mock return value to mocked module
  createClient.mockImplementation(() => createMockClient());

  process.env['NX_VEGA_URL'] = mockEnvironmentState.VEGA_URL;
  process.env['NX_VEGA_ENV'] = mockEnvironmentState.VEGA_ENV;
  process.env['NX_VEGA_CONFIG_URL'] = mockEnvironmentState.VEGA_CONFIG_URL;
  process.env['NX_VEGA_NETWORKS'] = JSON.stringify(
    mockEnvironmentState.VEGA_NETWORKS
  );
  process.env['NX_ETHEREUM_PROVIDER_URL'] =
    mockEnvironmentState.ETHEREUM_PROVIDER_URL;
  process.env['NX_ETHERSCAN_URL'] = mockEnvironmentState.ETHERSCAN_URL;
  process.env['NX_GIT_BRANCH'] = mockEnvironmentState.GIT_BRANCH;
  process.env['NX_GIT_ORIGIN_URL'] = mockEnvironmentState.GIT_ORIGIN_URL;
  process.env['NX_GIT_COMMIT_HASH'] = mockEnvironmentState.GIT_COMMIT_HASH;
  process.env['NX_GITHUB_FEEDBACK_URL'] =
    mockEnvironmentState.GITHUB_FEEDBACK_URL;
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('useEnvironment hook', () => {
  it('transforms and exposes values from the environment', async () => {
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    await waitFor(() => {
      expect(result.current).toEqual({
        ...mockEnvironmentState,
        setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
      });
    });
  });
});

it('allows for the VEGA_CONFIG_URL to be missing when there is a VEGA_URL present', async () => {
  delete process.env['NX_VEGA_CONFIG_URL'];
  const { result } = renderHook(() => useEnvironment(), {
    wrapper: MockWrapper,
  });

  expect(result.current).toEqual({
    ...mockEnvironmentState,
    VEGA_CONFIG_URL: undefined,
    setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
  });
});

it('allows for the VEGA_NETWORKS to be missing from the environment', async () => {
  act(async () => {
    delete process.env['NX_VEGA_NETWORKS'];
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    await waitFor(() => {
      expect(result.current).toEqual({
        ...mockEnvironmentState,
        VEGA_NETWORKS: {},
        setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
      });
    });
  });
});

it('when VEGA_NETWORKS is not a valid json, prints a warning and continues without using the value from it', async () => {
  act(async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(noop);
    process.env['NX_VEGA_NETWORKS'] = '{not:{valid:json';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    await waitFor(() => {
      expect(result.current).toEqual({
        ...mockEnvironmentState,
        VEGA_NETWORKS: {},
        setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
      });
    });

    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});

it.each`
  env                  | etherscanUrl                      | providerUrl
  ${Networks.DEVNET}   | ${'https://sepolia.etherscan.io'} | ${'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
  ${Networks.TESTNET}  | ${'https://sepolia.etherscan.io'} | ${'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
  ${Networks.STAGNET3} | ${'https://sepolia.etherscan.io'} | ${'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
  ${Networks.MAINNET}  | ${'https://etherscan.io'}         | ${'https://mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
`(
  'uses correct default ethereum connection variables in $env',
  async ({ env, etherscanUrl, providerUrl }) => {
    act(async () => {
      // @ts-ignore allow adding a mock return value to mocked module
      createClient.mockImplementation(() => createMockClient({ network: env }));

      process.env['NX_VEGA_ENV'] = env;
      delete process.env['NX_ETHEREUM_PROVIDER_URL'];
      delete process.env['NX_ETHERSCAN_URL'];
      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          VEGA_ENV: env,
          ETHEREUM_PROVIDER_URL: providerUrl,
          ETHERSCAN_URL: etherscanUrl,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  }
);

describe('node selection', () => {
  it('updates the VEGA_URL from the config when it is missing from the environment', async () => {
    act(async () => {
      delete process.env['NX_VEGA_URL'];
      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          VEGA_URL: MOCK_HOST,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  it('updates the VEGA_URL with the quickest node to respond from the config urls', async () => {
    act(async () => {
      delete process.env['NX_VEGA_URL'];

      const mockNodes: Record<string, MockRequestConfig> = {
        'https://mock-node-1.com': { hasError: false, delay: 4 },
        'https://mock-node-2.com': { hasError: false, delay: 5 },
        'https://mock-node-3.com': { hasError: false, delay: 8 },
        'https://mock-node-4.com': { hasError: false, delay: 0 },
      };

      // @ts-ignore: typescript doesn't recognize the mock implementation
      global.fetch.mockImplementation(
        setupFetch(mockEnvironmentState.VEGA_CONFIG_URL, Object.keys(mockNodes))
      );
      // @ts-ignore allow adding a mock return value to mocked module
      createClient.mockImplementation((url: keyof typeof mockNodes) => {
        return createMockClient({ statistics: mockNodes[url] });
      });

      const nodeUrl = getQuickestNode(mockNodes);

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          VEGA_URL: nodeUrl,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  it('ignores failing nodes and selects the first successful one to use', async () => {
    act(async () => {
      delete process.env['NX_VEGA_URL'];

      const mockNodes: Record<string, MockRequestConfig> = {
        'https://mock-node-1.com': { hasError: true, delay: 4 },
        'https://mock-node-2.com': { hasError: false, delay: 5 },
        'https://mock-node-3.com': { hasError: false, delay: 8 },
        'https://mock-node-4.com': { hasError: true, delay: 0 },
      };

      // @ts-ignore: typescript doesn't recognize the mock implementation
      global.fetch.mockImplementation(
        setupFetch(mockEnvironmentState.VEGA_CONFIG_URL, Object.keys(mockNodes))
      );
      // @ts-ignore allow adding a mock return value to mocked module
      createClient.mockImplementation((url: keyof typeof mockNodes) => {
        return createMockClient({ statistics: mockNodes[url] });
      });

      const nodeUrl = getQuickestNode(mockNodes);

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          VEGA_URL: nodeUrl,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  it('has a network error when cannot connect to any nodes', async () => {
    act(async () => {
      delete process.env['NX_VEGA_URL'];

      const mockNodes: Record<string, MockRequestConfig> = {
        'https://mock-node-1.com': { hasError: true, delay: 4 },
        'https://mock-node-2.com': { hasError: true, delay: 5 },
        'https://mock-node-3.com': { hasError: true, delay: 8 },
        'https://mock-node-4.com': { hasError: true, delay: 0 },
      };

      // @ts-ignore: typescript doesn't recognize the mock implementation
      global.fetch.mockImplementation(
        setupFetch(mockEnvironmentState.VEGA_CONFIG_URL, Object.keys(mockNodes))
      );
      // @ts-ignore allow adding a mock return value to mocked module
      createClient.mockImplementation((url: keyof typeof mockNodes) => {
        return createMockClient({ statistics: mockNodes[url] });
      });

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          VEGA_URL: undefined,
          networkError: ErrorType.CONNECTION_ERROR_ALL,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  it('has a network error when it cannot fetch the network config and there is no VEGA_URL in the environment', async () => {
    act(async () => {
      delete process.env['NX_VEGA_URL'];

      // @ts-ignore: typescript doesn't recognize the mock implementation
      global.fetch.mockImplementation(() => {
        throw new Error('Cannot fetch');
      });

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          VEGA_URL: undefined,
          networkError: ErrorType.CONFIG_LOAD_ERROR,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  it('logs an error when it cannot fetch the network config and there is a VEGA_URL in the environment', async () => {
    act(async () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(noop);

      // @ts-ignore: typescript doesn't recognize the mock implementation
      global.fetch.mockImplementation(() => {
        throw new Error('Cannot fetch');
      });

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          getErrorByType(
            ErrorType.CONFIG_LOAD_ERROR,
            mockEnvironmentState.VEGA_ENV
          )?.headline
        );
      });
    });
  });

  // SKIP due to https://github.com/facebook/jest/issues/12670
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('has a network error when the config is invalid and there is no VEGA_URL in the environment', async () => {
    act(async () => {
      delete process.env['NX_VEGA_URL'];

      // @ts-ignore: typescript doesn't recognize the mock implementation
      global.fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ some: 'invalid-object' }),
        })
      );

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          VEGA_URL: undefined,
          networkError: ErrorType.CONFIG_VALIDATION_ERROR,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  // SKIP due to https://github.com/facebook/jest/issues/12670
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('logs an error when the network config in invalid and there is a VEGA_URL in the environment', async () => {
    act(async () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(noop);

      // @ts-ignore: typescript doesn't recognize the mock implementation
      global.fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ some: 'invalid-object' }),
        })
      );

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          getErrorByType(
            ErrorType.CONFIG_VALIDATION_ERROR,
            mockEnvironmentState.VEGA_ENV
          )?.headline
        );
      });
    });
  });

  // SKIP due to https://github.com/facebook/jest/issues/12670
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('has a network error when the selected node is not a valid url', async () => {
    act(async () => {
      process.env['NX_VEGA_URL'] = 'not-url';

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          networkError: ErrorType.INVALID_URL,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  it('has a network error when cannot connect to the selected node', async () => {
    act(async () => {
      // @ts-ignore allow adding a mock return value to mocked module
      createClient.mockImplementation(() => {
        return createMockClient({ statistics: { hasError: true } });
      });

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          networkError: ErrorType.CONNECTION_ERROR,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });

  it('has a network error when the selected node has not subscription available', async () => {
    act(async () => {
      // @ts-ignore allow adding a mock return value to mocked module
      createClient.mockImplementation(() => {
        return createMockClient({ busEvents: { hasError: true } });
      });

      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockEnvironmentState,
          networkError: ErrorType.SUBSCRIPTION_ERROR,
          setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
        });
      });
    });
  });
});
