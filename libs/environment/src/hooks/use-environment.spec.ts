import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Networks } from '../types';
import { useEnvironment } from './use-environment';

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
  }),
}));

jest.mock('zustand');

global.fetch = jest.fn();

const setupFetch = (hosts: string[]) => {
  return () => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ hosts }),
    });
  };
};

const mockEnvVars = {
  VEGA_URL: 'https://vega.xyz',
  VEGA_ENV: Networks.TESTNET,
  VEGA_CONFIG_URL: 'https://vega.xyz/testnet-config.json',
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
  beforeEach(() => {
    // @ts-ignore asdf asdf asf
    fetch.mockClear();

    process.env['NX_VEGA_URL'] = mockEnvVars.VEGA_URL;
    process.env['NX_VEGA_ENV'] = mockEnvVars.VEGA_ENV;
    process.env['NX_VEGA_CONFIG_URL'] = mockEnvVars.VEGA_CONFIG_URL;
    process.env['NX_VEGA_NETWORKS'] = JSON.stringify(mockEnvVars.VEGA_NETWORKS);
    process.env['NX_ETHEREUM_PROVIDER_URL'] = mockEnvVars.ETHEREUM_PROVIDER_URL;
    process.env['NX_VEGA_WALLET_URL'] = mockEnvVars.VEGA_WALLET_URL;
    process.env['NX_ETHERSCAN_URL'] = mockEnvVars.ETHERSCAN_URL;
  });

  const setup = () => {
    return renderHook(() => useEnvironment());
  };

  it('transforms and exposes environment varialbes', async () => {
    const nodes = [
      'https://api.n00.foo.vega.xyz',
      'https://api.n01.foo.vega.xyz',
    ];
    // @ts-ignore: typscript doesn't recognise the mock implementation
    global.fetch.mockImplementation(setupFetch(nodes));
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      nodes,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(mockEnvVars.VEGA_CONFIG_URL);
  });

  it('allows for the VEGA_CONFIG_URL to be missing when there is a VEGA_URL present', async () => {
    delete process.env['NX_VEGA_CONFIG_URL'];
    const { result } = setup();
    await act(async () => {
      result.current.initialize();
    });
    expect(result.current).toMatchObject({
      ...mockEnvVars,
      VEGA_CONFIG_URL: undefined,
    });
  });
});
