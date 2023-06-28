import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import type { ClientOptions } from '@vegaprotocol/apollo-client';
import { createClient } from '@vegaprotocol/apollo-client';
import { Networks } from '../types';
import { STORAGE_KEY, useEnvironment } from './use-environment';

const noop = () => {
  /* no op*/
};

jest.mock('@vegaprotocol/apollo-client');
jest.mock('zustand');

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
const setupFetch = ({ hosts }: any) => {
  const result = `
  [API]
      [API.GraphQL]
          Hosts = ${JSON.stringify(hosts)}
  `;
  return () => {
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

  it('exposes env vars and sets VEGA_URL from config nodes', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    const nodes = [
      'https://api.n00.foo.vega.xyz',
      'https://api.n01.foo.vega.xyz',
    ];
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(setupFetch({ hosts: nodes }));

    const { result } = setup();

    expect(result.current.status).toBe('default');

    act(() => {
      result.current.initialize();
    });

    expect(result.current.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // resulting VEGA_URL should be one of the nodes from the config
    expect(nodes.includes(result.current.VEGA_URL as string)).toBe(true);
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
  });

  it('uses the first successfully responding node', async () => {
    jest.useFakeTimers();
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;

    const slowNode = 'https://api.n00.foo.vega.xyz';
    const slowWait = 2000;
    const fastNode = 'https://api.n01.foo.vega.xyz';
    const fastWait = 1000;
    const nodes = [slowNode, fastNode];
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(setupFetch({ hosts: nodes }));

    mockCreateClient.mockImplementation((obj: ClientOptions) => ({
      query: () =>
        new Promise((resolve) => {
          const wait = obj.url === fastNode ? fastWait : slowWait;
          setTimeout(() => {
            resolve({
              data: {
                statistics: {
                  chainId: 'chain-id',
                  blockHeight: '100',
                  vegaTime: new Date().toISOString(),
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

    jest.runAllTimers();

    await waitFor(() => {
      expect(result.current.status).toEqual('success');
    });

    expect(result.current.VEGA_URL).toBe(fastNode);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(fastNode);
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
    jest.useRealTimers();
  });

  it('passes a node if both queries and subscriptions working', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    const successNode = 'https://api.n01.foo.vega.xyz';
    const failNode = 'https://api.n00.foo.vega.xyz';
    const nodes = [failNode, successNode];
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(setupFetch({ hosts: nodes }));
    mockCreateClient.mockImplementation((clientOptions: ClientOptions) => ({
      query: () =>
        Promise.resolve({
          data: {
            statistics: {
              chainId: 'chain-id',
              blockHeight: '100',
              vegaTime: new Date().toISOString(),
            },
          },
        }),
      subscribe: () => ({
        // eslint-disable-next-line
        subscribe: (obj: any) => {
          if (clientOptions.url === failNode) {
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

    expect(result.current.VEGA_URL).toBe(successNode);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(successNode);
  });

  it('fails initialization if no suitable node is found', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    const nodes = [
      'https://api.n00.foo.vega.xyz',
      'https://api.n01.foo.vega.xyz',
    ];
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(setupFetch({ hosts: nodes }));

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

    expect(result.current.VEGA_URL).toBe(undefined); // VEGA_URL is unset, app should handle some UI
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
  });

  it('uses env vars from window._env_ if set', async () => {
    const url = 'http://foo.bar.com';
    // @ts-ignore _env_ is declared in app
    window._env_ = {
      VEGA_URL: url,
    };

    const { result } = setup();

    await act(async () => {
      result.current.initialize();
    });

    expect(result.current.VEGA_URL).toBe(url);

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

  it('errors if neither VEGA_URL or VEGA_CONFIG_URL are set', async () => {
    const error = console.error;
    console.error = noop;
    process.env['NX_VEGA_ENV'] = undefined;
    process.env['NX_VEGA_URL'] = undefined;
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current).toMatchObject({
      status: 'failed',
    });
    console.error = error;
  });

  it('allows for undefined VEGA_CONFIG_URL if VEGA_URL is set', async () => {
    const url = 'https://my.vega.url';
    process.env['NX_VEGA_URL'] = url;
    process.env['NX_VEGA_CONFIG_URL'] = undefined;
    const { result } = setup();
    act(() => {
      result.current.initialize();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(result.current).toMatchObject({
      VEGA_URL: url,
      VEGA_CONFIG_URL: undefined,
    });
  });

  it('allows for undefined VEGA_URL if VEGA_CONFIG_URL is set', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    process.env['NX_VEGA_URL'] = undefined;
    const nodes = [
      'https://api.n00.foo.vega.xyz',
      'https://api.n01.foo.vega.xyz',
    ];
    // @ts-ignore setup mock fetch for config url
    global.fetch.mockImplementation(setupFetch({ hosts: nodes }));
    const { result } = setup();
    act(() => {
      result.current.initialize();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(nodes.includes(result.current.VEGA_URL as string)).toBe(true);
  });

  it('handles error if node config cannot be fetched', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.toml';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    process.env['NX_VEGA_URL'] = undefined;
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
    process.env['NX_VEGA_URL'] = undefined;
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
    // @ts-ignore setup mock fetch for config url
    global.fetch.mockImplementation(
      setupFetch({ hosts: ['http://foo.bar.com'] })
    );
    const url = 'https://api.n00.foo.com';
    localStorage.setItem(STORAGE_KEY, url);
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current.VEGA_URL).toBe(url);
    expect(result.current.status).toBe('success');
  });

  it('can update VEGA_URL', async () => {
    const url = 'https://api.n00.foo.com';
    const newUrl = 'http://foo.bar.com';
    process.env['NX_VEGA_URL'] = url;
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current.VEGA_URL).toBe(url);
    expect(result.current.status).toBe('success');
    act(() => {
      result.current.setUrl(newUrl);
    });
    expect(result.current.VEGA_URL).toBe(newUrl);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(newUrl);
  });
});
