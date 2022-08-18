// having the node switcher dialog in the environment provider breaks the test renderer
// workaround based on: https://github.com/facebook/react/issues/11565
import type { ComponentProps, ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import createClient from '../utils/apollo-client';
import { useEnvironment, EnvironmentProvider } from './use-environment';
import { Networks } from '../types';
import createMockClient from './mocks/apollo-client';
jest.mock('../utils/apollo-client');

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

describe('throws error', () => {
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

  beforeEach(() => jest.resetModules()); // clears the cache of the modules
  it('throws a validation error when NX_ETHERSCAN_URL is not a valid url', () => {
    process.env['NX_ETHERSCAN_URL'] = 'invalid-url';
    const result = () =>
      renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
    expect(result).toThrow(
      `The NX_ETHERSCAN_URL environment variable must be a valid url`
    );
  });

  it('throws a validation error when NX_ETHEREUM_PROVIDER_URL is not a valid url', () => {
    process.env['NX_ETHEREUM_PROVIDER_URL'] = 'invalid-url';
    const result = () =>
      renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
    expect(result).toThrow(
      `The NX_ETHEREUM_PROVIDER_URL environment variable must be a valid url`
    );
  });

  it('throws a validation error when VEGA_NETWORKS is has an invalid network as a key', () => {
    process.env['NX_VEGA_NETWORKS'] = JSON.stringify({
      NOT_A_NETWORK: 'https://somewhere.url',
    });
    const result = () =>
      renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
    expect(result).toThrow(
      `All keys in NX_VEGA_NETWORKS must represent a valid environment: CUSTOM | TESTNET | STAGNET | STAGNET2 | STAGNET3 | DEVNET | MAINNET`
    );
  });

  it('throws a validation error when both VEGA_URL and VEGA_CONFIG_URL are missing in the environment', () => {
    delete process.env['NX_VEGA_URL'];
    delete process.env['NX_VEGA_CONFIG_URL'];
    const result = () =>
      renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
    expect(result).toThrow(
      `Must provide either NX_VEGA_CONFIG_URL or NX_VEGA_URL in the environment.`
    );
  });

  it('throws a validation error when NX_VEGA_ENV is not found in the environment', () => {
    delete process.env['NX_VEGA_ENV'];
    const result = () =>
      renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
    expect(result).toThrow(
      `NX_VEGA_ENV is invalid, received "undefined" instead of: 'CUSTOM' | 'TESTNET' | 'STAGNET' | 'STAGNET2' | 'STAGNET3' | 'DEVNET' | 'MAINNET'`
    );
  });

  it('throws a validation error when VEGA_ENV is not a valid network', () => {
    process.env['NX_VEGA_ENV'] = 'SOMETHING';
    const result = () =>
      renderHook(() => useEnvironment(), {
        wrapper: MockWrapper,
      });
    expect(result).not.toThrow(
      `Error processing the vega app environment:
    - NX_VEGA_ENV is invalid, received "SOMETHING" instead of: CUSTOM | TESTNET | STAGNET | STAGNET2 | DEVNET | MAINNET`
    );
  });
});
