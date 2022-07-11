// having the node switcher dialog in the environment provider breaks the test renderer
// workaround based on: https://github.com/facebook/react/issues/11565
import type { ComponentProps, ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import type { EnvironmentState } from './use-environment';
import { useEnvironment, EnvironmentProvider } from './use-environment';
import { Networks } from '../types';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: ReactNode) => node,
}));

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
  VEGA_URL: 'https://vega.xyz',
  VEGA_ENV: Networks.TESTNET,
  VEGA_CONFIG_URL: 'https://vega.xyz/testnet-config.json',
  VEGA_NETWORKS: {
    TESTNET: 'https://testnet.url',
    STAGNET: 'https://stagnet.url',
    MAINNET: 'https://mainnet.url',
  },
  ETHEREUM_PROVIDER_URL: 'https://ether.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  GIT_BRANCH: 'test',
  GIT_ORIGIN_URL: 'https://github.com/test/repo',
  GIT_COMMIT_HASH: 'abcde01234',
  GITHUB_FEEDBACK_URL: 'https://github.com/test/feedback',
  setNodeSwitcherOpen: noop,
};

beforeEach(() => {
  // @ts-ignore: typscript doesn't recognise the mock implementation
  global.fetch.mockReset();
  // @ts-ignore: typscript doesn't recognise the mock implementation
  global.fetch.mockImplementation(mockFetch);

  window.localStorage.clear();

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
  // @ts-ignore: typescript doesn't recognise the mocked fetch instance
  fetch.mockRestore();
  window.localStorage.clear();

  delete process.env['NX_VEGA_URL'];
  delete process.env['NX_VEGA_ENV'];
  delete process.env['NX_VEGA_CONFIG_URL'];
  delete process.env['NX_VEGA_NETWORKS'];
  delete process.env['NX_ETHEREUM_PROVIDER_URL'];
  delete process.env['NX_ETHERSCAN_URL'];
  delete process.env['NX_GIT_BRANCH'];
  delete process.env['NX_GIT_ORIGIN_URL'];
  delete process.env['NX_GIT_COMMIT_HASH'];
  delete process.env['NX_GITHUB_FEEDBACK_URL'];
});

describe('useEnvironment hook', () => {
  it('transforms and exposes values from the environment', () => {
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).toBe(undefined);
    expect(result.current).toEqual({
      ...mockEnvironmentState,
      setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
    });
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
      setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
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
      setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
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
      setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
    });
  });

  it('throws a validation error when NX_VEGA_ENV is not found in the environment', async () => {
    delete process.env['NX_VEGA_ENV'];
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error?.message).toContain(
      `NX_VEGA_ENV is invalid, received "undefined" instead of: 'CUSTOM' | 'TESTNET' | 'STAGNET' | 'STAGNET2' | 'DEVNET' | 'MAINNET'`
    );
  });

  it('throws a validation error when VEGA_ENV is not a valid network', () => {
    process.env['NX_VEGA_ENV'] = 'SOMETHING';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error).not.toContain(
      `NX_VEGA_ENV is invalid, received "SOMETHING" instead of: CUSTOM | TESTNET | STAGNET | STAGNET2 | DEVNET | MAINNET`
    );
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
      setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
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
    expect(result.error?.message).toContain(
      `All keys in NX_VEGA_NETWORKS must represent a valid environment: CUSTOM | TESTNET | STAGNET | STAGNET2 | DEVNET | MAINNET`
    );
  });

  it('throws a validation error when both VEGA_URL and VEGA_CONFIG_URL are missing in the environment', () => {
    delete process.env['NX_VEGA_URL'];
    delete process.env['NX_VEGA_CONFIG_URL'];
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error?.message).toContain(
      `Must provide either NX_VEGA_CONFIG_URL or NX_VEGA_URL in the environment.`
    );
  });

  it.each`
    env                  | etherscanUrl                      | providerUrl
    ${Networks.DEVNET}   | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.TESTNET}  | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.STAGNET}  | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.STAGNET2} | ${'https://ropsten.etherscan.io'} | ${'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
    ${Networks.MAINNET}  | ${'https://etherscan.io'}         | ${'https://mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'}
  `(
    'uses correct default ethereum connection variables in $env',
    async ({ env, etherscanUrl, providerUrl }) => {
      process.env['NX_VEGA_ENV'] = env;
      delete process.env['NX_ETHEREUM_PROVIDER_URL'];
      delete process.env['NX_ETHERSCAN_URL'];
      const { result } = renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
      expect(result.error).toBe(undefined);
      expect(result.current).toEqual({
        ...mockEnvironmentState,
        VEGA_ENV: env,
        ETHEREUM_PROVIDER_URL: providerUrl,
        ETHERSCAN_URL: etherscanUrl,
        setNodeSwitcherOpen: result.current.setNodeSwitcherOpen,
      });
    }
  );

  it('throws a validation error when NX_ETHERSCAN_URL is not a valid url', async () => {
    process.env['NX_ETHERSCAN_URL'] = 'invalid-url';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error?.message).toContain(
      `The NX_ETHERSCAN_URL environment variable must be a valid url`
    );
  });

  it('throws a validation error when NX_ETHEREUM_PROVIDER_URL is not a valid url', async () => {
    process.env['NX_ETHEREUM_PROVIDER_URL'] = 'invalid-url';
    const { result } = renderHook(() => useEnvironment(), {
      wrapper: MockWrapper,
    });
    expect(result.error?.message).toContain(
      `The NX_ETHEREUM_PROVIDER_URL environment variable must be a valid url`
    );
  });
});
