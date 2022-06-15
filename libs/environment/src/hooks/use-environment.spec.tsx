import type { ComponentProps } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import type { EnvironmentState } from './use-environment';
import { useEnvironment, EnvironmentProvider } from './use-environment';
import { ContractAddresses, Networks } from '../types';

const MockWrapper = (props: ComponentProps<typeof EnvironmentProvider>) => {
  return <EnvironmentProvider {...props} />;
};

const MOCK_HOST = 'https://vega.host/query';

global.fetch = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const mockFetch = (url: RequestInfo) => {
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
};

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
  ETHEREUM_CHAIN_ID: 5,
  ETHEREUM_PROVIDER_URL: 'https://ether.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  ADDRESSES: ContractAddresses[Networks.TESTNET],
};

beforeEach(() => {
  // @ts-ignore typscript doesn't recognise the mock implementation
  global.fetch.mockReset();
  // @ts-ignore typscript doesn't recognise the mock implementation
  global.fetch.mockImplementation(mockFetch);

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

afterAll(() => {
  // @ts-ignore: typescript doesn't recognise the mocked fetch instance
  fetch.mockRestore();
  window.localStorage.clear();

  delete process.env['NX_VEGA_URL'];
  delete process.env['NX_VEGA_ENV'];
  delete process.env['NX_VEGA_CONFIG_URL'];
  delete process.env['NX_ETHEREUM_CHAIN_ID'];
  delete process.env['NX_ETHEREUM_PROVIDER_URL'];
  delete process.env['NX_ETHERSCAN_URL'];
  delete process.env['NX_VEGA_NETWORKS'];
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

  it('allows for the VEGA_URL to be missing when there is a VEGA_CONFIG_URL present', async () => {
    delete process.env['NX_VEGA_URL'];
    const { result, waitForNextUpdate } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    await waitForNextUpdate();

    expect(result.error).toBe(undefined);
    expect(result.current).toEqual({
      ...mockEnvironmentState,
      VEGA_URL: MOCK_HOST,
    });
  });

  it('allows for the VEGA_NETWORKS to be missing from the environment', () => {
    delete process.env['NX_VEGA_NETWORKS'];
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).toBe(undefined);
    expect(result.current).toEqual({
      ...mockEnvironmentState,
      VEGA_NETWORKS: {},
    });
  });

  it('throws a validation error when NX_VEGA_ENV is not found in the environment', async () => {
    delete process.env['NX_VEGA_ENV'];
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).not.toBe(undefined);
  });

  it('throws a validation error when VEGA_ENV is not a valid network', () => {
    process.env['NX_VEGA_ENV'] = 'SOMETHING';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).not.toBe(undefined);
  });

  it('when VEGA_NETWORKS is not a valid json, prints a warning and continues without using the value from it', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(noop);
    process.env['NX_VEGA_NETWORKS'] = '{not:{valid:json';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).toBe(undefined);
    expect(result.current).toEqual({
      ...mockEnvironmentState,
      VEGA_NETWORKS: {},
    });

    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
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

  it.each`
    env                  | chainId | etherscanUrl                      | providerUrl
    ${Networks.DEVNET}   | ${3}    | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.TESTNET}  | ${3}    | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.STAGNET}  | ${3}    | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.STAGNET2} | ${3}    | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.MAINNET}  | ${1}    | ${'https://etherscan.io'}         | ${'https://mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
  `(
    'uses correct default ethereum connection variables in $env',
    async ({ env, chainId, etherscanUrl, providerUrl }) => {
      process.env['NX_VEGA_ENV'] = env;
      delete process.env['NX_ETHEREUM_CHAIN_ID'];
      delete process.env['NX_ETHEREUM_PROVIDER_URL'];
      delete process.env['NX_ETHERSCAN_URL'];
      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
      expect(result.error).toBe(undefined);
      expect(result.current).toEqual({
        ...mockEnvironmentState,
        VEGA_ENV: env,
        ETHEREUM_CHAIN_ID: Number(chainId),
        ETHEREUM_PROVIDER_URL: providerUrl,
        ETHERSCAN_URL: etherscanUrl,
        ADDRESSES: ContractAddresses[env as Networks],
      });
    }
  );
});
