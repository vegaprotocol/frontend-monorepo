import type { ComponentProps } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { Networks, EnvironmentConfig } from '@vegaprotocol/smart-contracts';
import type { EnvironmentState } from './use-environment';
import { useEnvironment, EnvironmentProvider } from './use-environment';

const MockWrapper = (props: ComponentProps<typeof EnvironmentProvider>) => {
  return <EnvironmentProvider {...props} />;
};

const MOCK_HOST = 'https://vega.host/query';

global.fetch = jest.fn((url: RequestInfo) => {
  if (url === mockEnvironmentState.VEGA_CONFIG_URL) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          hosts: [MOCK_HOST],
        }),
    } as Response);
  }
  return Promise.resolve({ ok: true } as Response);
});

const mockEnvironmentState: EnvironmentState = {
  configStatus: 'success',
  VEGA_URL: 'https://vega.xyz',
  VEGA_ENV: Networks.TESTNET,
  VEGA_CONFIG_URL: 'https://vega.xyz/testnet-config.json',
  VEGA_NETWORKS: {
    TESTNET: 'https://testnet.url',
    STAGNET: 'https://stagnet.url',
    MAINNET: 'https://mainnet.url',
  },
  ETHEREUM_CHAIN_ID: 3,
  ETHEREUM_PROVIDER_URL: 'https://ether.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  ADDRESSES: EnvironmentConfig[Networks.TESTNET],
};

beforeEach(() => {
  // @ts-ignore typscript doesn't recognise the mock implementation
  global.fetch.mockReset();
  window.localStorage.clear();

  process.env['NX_VEGA_URL'] = mockEnvironmentState.VEGA_URL;
  process.env['NX_VEGA_ENV'] = mockEnvironmentState.VEGA_ENV;
  process.env['NX_VEGA_CONFIG_URL'] = mockEnvironmentState.VEGA_CONFIG_URL;
  process.env['NX_ETHEREUM_CHAIN_ID'] = String(
    mockEnvironmentState.ETHEREUM_CHAIN_ID
  );
  process.env['NX_ETHEREUM_PROVIDER_URL'] =
    mockEnvironmentState.ETHEREUM_PROVIDER_URL;
  process.env['NX_ETHERSCAN_URL'] = mockEnvironmentState.ETHERSCAN_URL;
  process.env['NX_VEGA_NETWORKS'] = JSON.stringify(
    mockEnvironmentState.VEGA_NETWORKS
  );
});

describe('useEnvironment hook', () => {
  it('transforms and exposes values from the environment', () => {
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).toBe(undefined);
    expect(result.current).toEqual(mockEnvironmentState);
  });

  it('allows for the VEGA_CONFIG_URL to be missing when there is a VEGA_URL present', () => {
    delete process.env['NX_VEGA_CONFIG_URL'];
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).toBe(undefined);
    expect(result.current).toEqual({
      ...mockEnvironmentState,
      VEGA_CONFIG_URL: undefined,
    });
  });

  // it('allows for the VEGA_URL to be missing when there is a VEGA_CONFIG_URL present', async () => {
  //   delete process.env['NX_VEGA_URL'];
  //   const { result, waitForNextUpdate } = renderHook(() => useEnvironment(), {
  //     wrapper: MockWrapper,
  //   });
  //   await waitForNextUpdate();
  //   expect(result.error).toBe(undefined);
  //   expect(result.current).toEqual({
  //     ...mockEnvironmentState,
  //     VEGA_URL: MOCK_HOST,
  //   });
  // });

  it.each`
    key
    ${'NX_VEGA_ENV'}
    ${'NX_ETHEREUM_CHAIN_ID'}
    ${'NX_ETHEREUM_PROVIDER_URL'}
    ${'NX_ETHERSCAN_URL'}
  `(
    'throws a validation error when $key is not found in the environment',
    async ({ key }) => {
      delete process.env[key];
      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
      expect(result.error).not.toBe(undefined);
    }
  );

  it('throws a validation error when VEGA_ENV is not a valid network', () => {
    process.env['NX_VEGA_ENV'] = 'SOMETHING';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).not.toBe(undefined);
  });

  it('throws a validation error when VEGA_NETWORKS is not a valid json', () => {
    process.env['NX_VEGA_NETWORKS'] = '{not:{valid:json';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).not.toBe(undefined);
  });

  it('throws a validation error when VEGA_NETWORKS is has an invalid network as a key', () => {
    process.env['NX_VEGA_NETWORKS'] = JSON.stringify({
      NOT_A_NETWORK: 'https://somewhere.url',
    });
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).not.toBe(undefined);
  });

  it('throws a validation error when both VEGA_URL and VEGA_CONFIG_URL are missing in the environment', () => {
    delete process.env['NX_VEGA_URL'];
    delete process.env['NX_VEGA_CONFIG_URL'];
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).not.toBe(undefined);
  });
});
