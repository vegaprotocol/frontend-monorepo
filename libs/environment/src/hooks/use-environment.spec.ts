import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Networks } from '../types';
import { useEnvironment } from './use-environment';

const noop = () => {
  /* no op*/
};

jest.mock('@vegaprotocol/apollo-client', () => ({
  createClient: () => ({
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
  }),
}));
jest.mock('zustand');

global.fetch = jest.fn();

// eslint-disable-next-line
const setupFetch = (result: any) => {
  return () => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(result),
    });
  };
};

const mockEnvVars = {
  VEGA_ENV: Networks.TESTNET,
  VEGA_NETWORKS: {
    DEVNET: 'https://devnet.url',
    TESTNET: 'https://testnet.url',
    STAGNET3: 'https://stagnet3.url',
    MAINNET: 'https://mainnet.url',
  },
  VEGA_WALLET_URL: 'https://localhost:1234',
  ETHEREUM_PROVIDER_URL: 'https://ether.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
};

describe('useEnvironment', () => {
  const env = process.env;

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
  });

  afterEach(() => {
    process.env = env;
  });

  const setup = () => {
    return renderHook(() => useEnvironment());
  };

  it('exposes env vars and sets VEGA_URL from config nodes', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.json';
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
    expect(
      result.current.VEGA_URL === nodes[0] ||
        result.current.VEGA_URL === nodes[1]
    ).toBe(true);
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
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
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current).toMatchObject({
      VEGA_URL: url,
      VEGA_CONFIG_URL: undefined,
    });
  });

  it('allows for undefined VEGA_URL if VEGA_CONFIG_URL is set', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.json';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    process.env['NX_VEGA_URL'] = undefined;
    const nodes = [
      'https://api.n00.foo.vega.xyz',
      'https://api.n01.foo.vega.xyz',
    ];
    // @ts-ignore setup mock fetch for config url
    global.fetch.mockImplementation(setupFetch({ hosts: nodes }));
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(typeof result.current.VEGA_URL).toEqual('string');
    expect(result.current.VEGA_URL).not.toBeFalsy();
  });

  it('handles error if node config cannot be fetched', async () => {
    const warn = console.warn;
    console.warn = noop;
    const configUrl = 'https://vega.xyz/testnet-config.json';
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
    expect(typeof result.current.error).toBe('string');
    expect(result.current.error).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
    console.warn = warn;
  });

  it('handles an invalid node config', async () => {
    const warn = console.warn;
    console.warn = noop;
    const configUrl = 'https://vega.xyz/testnet-config.json';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    process.env['NX_VEGA_URL'] = undefined;
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(setupFetch({ invalid: 'invalid' }));
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current.status).toEqual('failed');
    expect(typeof result.current.error).toBe('string');
    expect(result.current.error).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(configUrl);
    console.warn = warn;
  });

  it('uses stored url', async () => {
    const configUrl = 'https://vega.xyz/testnet-config.json';
    process.env['NX_VEGA_CONFIG_URL'] = configUrl;
    // @ts-ignore setup mock fetch for config url
    global.fetch.mockImplementation(
      setupFetch({ hosts: ['http://foo.bar.com'] })
    );
    const url = 'https://api.n00.foo.com';
    localStorage.setItem('vega_url', url);
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
    expect(localStorage.getItem('vega_url')).toBe(newUrl);
  });
});
