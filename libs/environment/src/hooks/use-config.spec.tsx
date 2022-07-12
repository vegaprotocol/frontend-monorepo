import { renderHook } from '@testing-library/react-hooks';
import type { EnvironmentWithOptionalUrl } from './use-config';
import { useConfig } from './use-config';
import { Networks, ErrorType } from '../types';

const mockConfig = {
  hosts: [
    'https://vega-host-1.com',
    'https://vega-host-2.com',
    'https://vega-host-3.com',
    'https://vega-host-4.com',
  ],
};

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

function setupFetch(configUrl: string) {
  return (url: RequestInfo) => {
    if (url === configUrl) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as Response);
    }

    return Promise.resolve({
      ok: true,
    } as Response);
  };
}

global.fetch = jest.fn();

const onError = jest.fn();

beforeAll(() => {
  jest.useFakeTimers();
});

beforeEach(() => {
  onError.mockClear();
  window.localStorage.clear();

  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockReset();
  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockImplementation(
    setupFetch(mockEnvironment.VEGA_CONFIG_URL ?? '')
  );
});

afterAll(() => {
  // @ts-ignore: typescript doesn't recognise the mocked fetch instance
  fetch.mockRestore();
});

describe('useConfig hook', () => {
  it("doesn't update when there is no VEGA_CONFIG_URL in the environment", async () => {
    const mockEnvWithoutUrl = {
      ...mockEnvironment,
      VEGA_CONFIG_URL: undefined,
    };
    const { result } = renderHook(() => useConfig(mockEnvWithoutUrl, onError));

    expect(result.current.config).toBe(undefined);
  });

  it('fetches configuration from the provided url', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, onError)
    );

    await waitForNextUpdate();
    expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
    expect(result.current.config).toEqual(mockConfig);
  });

  it('caches the configuration', async () => {
    const { result: firstResult, waitForNextUpdate: waitForFirstUpdate } =
      renderHook(() => useConfig(mockEnvironment, onError));

    await waitForFirstUpdate();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(firstResult.current.config).toEqual(mockConfig);

    const { result: secondResult } = renderHook(() =>
      useConfig(mockEnvironment, onError)
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(secondResult.current.config).toEqual(mockConfig);
  });

  it('executes the error callback when the config endpoint fails', async () => {
    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation(() => Promise.reject());

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, onError)
    );

    await waitForNextUpdate();
    expect(result.current.config).toBe(undefined);
    expect(onError).toHaveBeenCalledWith(ErrorType.CONFIG_LOAD_ERROR);
  });

  it('executes the error callback when the config validation fails', async () => {
    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'not-valid-config' }),
      })
    );

    const { result, waitForNextUpdate } = renderHook(() =>
      useConfig(mockEnvironment, onError)
    );

    await waitForNextUpdate();
    expect(result.current.config).toBe(undefined);
    expect(onError).toHaveBeenCalledWith(ErrorType.CONFIG_VALIDATION_ERROR);
  });
});
