import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import type { ClientOptions } from '@vegaprotocol/apollo-client';
import { createClient } from '@vegaprotocol/apollo-client';
import { Networks } from '../types';
import {
  STORAGE_KEY,
  useEnvironment,
  featureFlagsLocalStorageKey,
  getUserEnabledFeatureFlags,
  setUserEnabledFeatureFlag,
} from './use-environment';
import { canMeasureResponseTime, measureResponseTime } from '../utils/time';

const noop = () => {
  /* no op*/
};

jest.mock('@vegaprotocol/apollo-client');
jest.mock('zustand');
jest.mock('../utils/time');

const mockCanMeasureResponseTime = canMeasureResponseTime as jest.Mock;
const mockMeasureResponseTime = measureResponseTime as jest.Mock;

const mockCreateClient = createClient as jest.Mock;
const createDefaultMockClient = () => {
  return () => ({
    query: () =>
      Promise.resolve({
        data: {
          statistics: {
            chainId: 'chain-id',
            blockHeight: '100',
            vegaTime: new Date().toISOString(),
          },
          networkParametersConnection: {
            edges: [
              {
                node: {
                  key: 'something',
                  value: 123,
                },
              },
            ],
          },
        },
      }),
    subscribe: () => ({
      // eslint-disable-next-line
      subscribe: (obj: any) => {
        obj.next();
      },
    }),
  });
};

global.fetch = jest.fn();
// eslint-disable-next-line
const setupFetch = ({ hosts, restHosts }: any) => {
  const result = `
  [API]
      [API.GraphQL]
          Hosts = ${JSON.stringify(hosts)}
      [API.REST]
          Hosts = ${JSON.stringify(restHosts)}
  `;
  return (url?: string) => {
    // rest api test
    if (url?.includes('/api/v2/info')) {
      return Promise.resolve({
        ok: true,
        json: () => ({
          commitHash: 'test',
          version: 'vTEST',
        }),
      });
    }

    // config fetch
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(result),
    });
  };
};

const mockEnvVars = {
  VEGA_ENV: Networks.TESTNET,
  VEGA_NETWORKS: {
    DEVNET: 'https://devnet.url',
    TESTNET: 'https://testnet.url',
    MAINNET: 'https://mainnet.url',
  },
  VEGA_WALLET_URL: 'https://localhost:1234',
  ETHEREUM_PROVIDER_URL: 'https://ether.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  CONFIGURED_WALLETS: ['injected', 'jsonRpc', 'snap', 'viewParty'],
};

describe('useEnvironment', () => {
  const env = process.env;
  // eslint-disable-next-line
  let warn: any;

  beforeAll(() => {
    warn = console.warn;
    console.warn = noop;
  });

  afterAll(() => {
    console.warn = warn;
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };

    process.env['NX_VEGA_ENV'] = mockEnvVars.VEGA_ENV;
    process.env['NX_VEGA_NETWORKS'] = JSON.stringify(mockEnvVars.VEGA_NETWORKS);
    process.env['NX_CONFIGURED_WALLETS'] = JSON.stringify(
      mockEnvVars.CONFIGURED_WALLETS
    );
    process.env['NX_ETHEREUM_PROVIDER_URL'] = mockEnvVars.ETHEREUM_PROVIDER_URL;
    process.env['NX_VEGA_WALLET_URL'] = mockEnvVars.VEGA_WALLET_URL;
    process.env['NX_ETHERSCAN_URL'] = mockEnvVars.ETHERSCAN_URL;

    // if config is fetched resulting suitable node
    // will be stored in localStorage
    localStorage.clear();

    // @ts-ignore clear mocked node config fetch
    fetch.mockClear();

    // reset default apollo client behaviour
    mockCreateClient.mockImplementation(createDefaultMockClient());
  });

  afterEach(() => {
    process.env = env;
  });

  const setup = () => {
    return renderHook(() => useEnvironment());
  };

  it('exposes env vars and sets API_NODE from config nodes', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;

    const nodes = [
      {
        graphQLApiUrl: 'https://api.n00.foo.vega.xyz/gql',
        restApiUrl: 'https://api.n00.foo.vega.xyz/rest',
      },
      {
        graphQLApiUrl: 'https://api.n01.foo.vega.xyz/gql',
        restApiUrl: 'https://api.n01.foo.vega.xyz/rest',
      },
    ];

    // @ts-ignore: typescript doesn't recognise the mock implementation
    global.fetch.mockImplementation(
      setupFetch({
        hosts: nodes.map((n) => n.graphQLApiUrl),
        restHosts: nodes.map((n) => n.restApiUrl),
      })
    );

    const { result } = setup();

    expect(result.current.status).toBe('default');

    act(() => {
      result.current.initialize();
    });

    expect(result.current.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // resulting API_NODE should be one of the nodes from the config
    expect(
      nodes
        .map((n) => n.graphQLApiUrl)
        .includes(result.current.API_NODE?.graphQLApiUrl as string)
    ).toBe(true);
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(3); // config + 2 rest api tests
    expect(fetch).toHaveBeenCalledWith(configUrl);
  });

  it('uses the first successfully responding node', async () => {
    jest.useFakeTimers();
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;

    const slowNode = {
      graphQLApiUrl: 'https://api.n00.foo.vega.xyz/gql',
      restApiUrl: 'https://api.n00.foo.vega.xyz/rest',
    };
    const slowWait = 2000;

    const fastNode = {
      graphQLApiUrl: 'https://api.n01.foo.vega.xyz/gql',
      restApiUrl: 'https://api.n01.foo.vega.xyz/rest',
    };
    const fastWait = 1000;

    const nodes = [slowNode, fastNode];

    mockCanMeasureResponseTime.mockImplementation(() => true);
    mockMeasureResponseTime.mockImplementation((url: string) => {
      if (url === slowNode.graphQLApiUrl) return slowWait;
      if (url === fastNode.graphQLApiUrl) return fastWait;
      return Infinity;
    });

    // @ts-ignore: typescript doesn't recognise the mock implementation
    global.fetch.mockImplementation(
      setupFetch({
        hosts: nodes.map((n) => n.graphQLApiUrl),
        restHosts: nodes.map((n) => n.restApiUrl),
      })
    );

    mockCreateClient.mockImplementation((obj: ClientOptions) => ({
      query: () =>
        new Promise((resolve) => {
          const wait = obj.url === fastNode.graphQLApiUrl ? fastWait : slowWait;
          setTimeout(() => {
            resolve({
              data: {
                statistics: {
                  chainId: 'chain-id',
                  blockHeight: '100',
                  vegaTime: new Date(1).toISOString(),
                },
                networkParametersConnection: {
                  edges: [
                    {
                      node: {
                        key: 'something',
                        value: 123,
                      },
                    },
                  ],
                },
              },
            });
          }, wait);
        }),
      subscribe: () => ({
        // eslint-disable-next-line
        subscribe: (obj: any) => {
          obj.next();
        },
      }),
    }));
    const { result } = setup();

    expect(result.current.status).toBe('default');

    act(() => {
      result.current.initialize();
    });

    expect(result.current.status).toBe('pending');

    // wait for nodes request to finish before running timer
    await waitFor(() => {
      expect(result.current.nodes).toEqual(nodes);
    });

    jest.advanceTimersByTime(2000);
    // jest.runAllTimers();

    await waitFor(() => {
      expect(result.current.status).toEqual('success');
    });

    expect(result.current.API_NODE).toEqual(fastNode);
    expect(localStorage.getItem(STORAGE_KEY)).toEqual(JSON.stringify(fastNode));
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith(configUrl);
    jest.useRealTimers();
  });

  it('passes a node if both queries and subscriptions working', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    const successNode = {
      graphQLApiUrl: 'https://api.n01.foo.vega.xyz/gql',
      restApiUrl: 'https://api.n01.foo.vega.xyz/rest',
    };
    const failNode = {
      graphQLApiUrl: 'https://api.n00.foo.vega.xyz/gql',
      restApiUrl: 'https://api.n00.foo.vega.xyz/rest',
    };
    const nodes = [failNode, successNode];
    // @ts-ignore: typescript doesn't recognise the mock implementation
    global.fetch.mockImplementation(
      setupFetch({
        hosts: nodes.map((n) => n.graphQLApiUrl),
        restHosts: nodes.map((n) => n.restApiUrl),
      })
    );
    mockCreateClient.mockImplementation((clientOptions: ClientOptions) => ({
      query: () =>
        Promise.resolve({
          data: {
            statistics: {
              chainId: 'chain-id',
              blockHeight: '100',
              vegaTime: new Date().toISOString(),
            },
            networkParametersConnection: {
              edges: [
                {
                  node: {
                    key: 'something',
                    value: 123,
                  },
                },
              ],
            },
          },
        }),
      subscribe: () => ({
        // eslint-disable-next-line
        subscribe: (obj: any) => {
          if (clientOptions.url === failNode.graphQLApiUrl) {
            // make n00 fail the subscription
            obj.error();
          } else {
            obj.next();
          }
        },
      }),
    }));

    const { result } = setup();

    expect(result.current.status).toBe('default');

    act(() => {
      result.current.initialize();
    });

    expect(result.current.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.API_NODE).toEqual(successNode);
    expect(localStorage.getItem(STORAGE_KEY)).toEqual(
      JSON.stringify(successNode)
    );
  });

  it('fails initialization if no suitable node is found', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    const nodes = [
      {
        graphQLApiUrl: 'https://api.n00.foo.vega.xyz/gql',
        restApiUrl: 'https://api.n00.foo.vega.xyz/rest',
      },
      {
        graphQLApiUrl: 'https://api.n01.foo.vega.xyz/gql',
        restApiUrl: 'https://api.n01.foo.vega.xyz/rest',
      },
    ];
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(
      setupFetch({
        hosts: nodes.map((n) => n.graphQLApiUrl),
        restHosts: nodes.map((n) => n.restApiUrl),
      })
    );

    // set all clients to fail both query and subscription
    mockCreateClient.mockImplementation(() => ({
      query: () => Promise.reject(),
      subscribe: () => ({
        // eslint-disable-next-line
        subscribe: (obj: any) => {
          obj.error();
        },
      }),
    }));

    const { result } = setup();

    expect(result.current.status).toBe('default');

    act(() => {
      result.current.initialize();
    });

    expect(result.current.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.status).toBe('failed');
    });

    expect(result.current.API_NODE).toEqual(undefined); // API_NODE is unset, app should handle some UI
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith(configUrl);
  });

  it('uses env vars from window._env_ if set', async () => {
    const apiNode = {
      graphQLApiUrl: 'http://foo.bar.com/graphql',
      restApiUrl: 'http://foo.bar.com/',
    };
    // @ts-ignore _env_ is declared in app
    window._env_ = {
      API_NODE: 'http://foo.bar.com',
    };

    const { result } = setup();

    await act(async () => {
      result.current.initialize();
    });

    expect(result.current.API_NODE).toEqual(apiNode);

    // @ts-ignore delete _env_
    delete window['_env_'];
  });

  it('sets error if environment is invalid', async () => {
    const error = console.error;
    console.error = noop;
    process.env['NX_VEGA_ENV'] = undefined; // VEGA_ENV is required by zod schema
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current).toMatchObject({
      status: 'failed',
      error: 'Error processing the Vega environment',
    });
    console.error = error;
  });

  it('errors if neither API_NODE or VEGA_CONFIG_URL are set', async () => {
    const error = console.error;
    console.error = noop;
    process.env['NX_VEGA_ENV'] = undefined;
    process.env['NX_API_NODE'] = undefined;
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current).toMatchObject({
      status: 'failed',
    });
    console.error = error;
  });

  it('allows for undefined VEGA_CONFIG_URL if API_NODE is set', async () => {
    const apiNode = {
      graphQLApiUrl: 'http://foo.bar.com/graphql',
      restApiUrl: 'http://foo.bar.com/',
    };

    process.env['NX_API_NODE'] = apiNode.restApiUrl;
    process.env['NX_VEGA_CONFIG_URL'] = undefined;
    const { result } = setup();
    act(() => {
      result.current.initialize();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(result.current).toMatchObject({
      API_NODE: apiNode,
      VEGA_CONFIG_URL: undefined,
    });
  });

  it('allows for undefined API_NODE if VEGA_CONFIG_URL is set', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    process.env['NX_API_NODE'] = undefined;
    const nodes = [
      {
        graphQLApiUrl: 'https://api.n00.foo.vega.xyz/graphql',
        restApiUrl: 'https://api.n00.foo.vega.xyz/',
      },
      {
        graphQLApiUrl: 'https://api.n01.foo.vega.xyz/graphql',
        restApiUrl: 'https://api.n01.foo.vega.xyz/',
      },
    ];
    // @ts-ignore setup mock fetch for config url
    global.fetch.mockImplementation(
      setupFetch({
        hosts: nodes.map((n) => n.graphQLApiUrl),
        restHosts: nodes.map((n) => n.restApiUrl),
      })
    );
    const { result } = setup();
    act(() => {
      result.current.initialize();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(
      nodes
        .map((n) => n.graphQLApiUrl)
        .includes(result.current.API_NODE?.graphQLApiUrl as string)
    ).toBe(true);
  });

  it('handles error if node config cannot be fetched', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    process.env['NX_API_NODE'] = undefined;
    // @ts-ignore setup mock fetch for config url
    global.fetch.mockImplementation(() => {
      throw new Error('failed to fetch');
    });
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current.status).toEqual('failed');
    expect(result.current.error).toBe(
      `Failed to fetch node config from ${configUrl}`
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
  });

  it('handles an invalid node config', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    process.env['NX_API_NODE'] = undefined;
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(setupFetch({ invalid: 'invalid' }));
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current.status).toEqual('failed');
    expect(result.current.error).toBe(
      `Failed to fetch node config from ${configUrl}`
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
  });

  it('uses stored url', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    const nodes = [
      {
        graphQLApiUrl: 'https://api.n00.foo.vega.xyz/graphql',
        restApiUrl: 'https://api.n00.foo.vega.xyz/',
      },
      {
        graphQLApiUrl: 'https://api.n01.foo.vega.xyz/graphql',
        restApiUrl: 'https://api.n01.foo.vega.xyz/',
      },
    ];
    // @ts-ignore setup mock fetch for config url
    global.fetch.mockImplementation(
      setupFetch({
        hosts: nodes.map((n) => n.graphQLApiUrl),
        restHosts: nodes.map((n) => n.restApiUrl),
      })
    );

    const storedNode = {
      graphQLApiUrl: 'https://api.n00.foo.com/graphql',
      restApiUrl: 'https://api.n00.foo.com/',
    };
    localStorage.setItem(STORAGE_KEY, 'https://api.n00.foo.com/');
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current.API_NODE?.graphQLApiUrl).toBe(
      storedNode.graphQLApiUrl
    );
    expect(result.current.status).toBe('success');
  });

  it('can update API_NODE', async () => {
    const apiNode = {
      graphQLApiUrl: 'https://api.n00.foo.vega.xyz/graphql',
      restApiUrl: 'https://api.n00.foo.vega.xyz/',
    };
    const newApiNode = {
      graphQLApiUrl: 'https://api.n01.foo.vega.xyz/graphql',
      restApiUrl: 'https://api.n01.foo.vega.xyz/',
    };
    process.env['NX_API_NODE'] = apiNode.restApiUrl;
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current.API_NODE).toEqual(apiNode);
    expect(result.current.status).toBe('success');
    act(() => {
      result.current.setApiNode(newApiNode);
    });
    expect(result.current.API_NODE).toEqual(newApiNode);
    expect(localStorage.getItem(STORAGE_KEY)).toEqual(
      JSON.stringify(newApiNode)
    );
  });
});

describe('getUserEnabledFeatureFlags', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('reads enabled flags from local storage', () => {
    localStorage.setItem(featureFlagsLocalStorageKey, 'ENABLE_HOMEPAGE,BLAH');
    const userEnabledFlags = getUserEnabledFeatureFlags(true, [
      'ENABLE_HOMEPAGE',
    ]);
    expect(userEnabledFlags).toEqual(['ENABLE_HOMEPAGE']);
  });
});

describe('setUserEnabledFeatureFlag', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('saves enabled flags to local storage', () => {
    setUserEnabledFeatureFlag('ENABLE_HOMEPAGE', true);
    expect(localStorage.getItem(featureFlagsLocalStorageKey)).toEqual(
      'ENABLE_HOMEPAGE'
    );
    expect(getUserEnabledFeatureFlags()).toEqual(['ENABLE_HOMEPAGE']);
  });
});
