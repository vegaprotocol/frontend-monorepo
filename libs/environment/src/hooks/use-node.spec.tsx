import { renderHook, act } from '@testing-library/react-hooks';
import { MockedProvider } from '@apollo/client/testing';

import { useNode, STATS_QUERY, TIME_UPDATE_SUBSCRIPTION } from './use-node';

const MOCK_DURATION = 1073;

const MOCK_STATISTICS_QUERY_RESULT = {
  blockHeight: '11',
  chainId: 'testnet_01234',
};

const initialState = {
  url: '',
  responseTime: {
    isLoading: false,
    hasError: false,
    value: undefined,
  },
  block: {
    isLoading: false,
    hasError: false,
    value: undefined,
  },
  ssl: {
    isLoading: false,
    hasError: false,
    value: undefined,
  },
  chain: {
    isLoading: false,
    hasError: false,
    value: undefined,
  },
};

const createMockClient = ({
  failStats = false,
  failSubscription = false,
}: { failStats?: boolean; failSubscription?: boolean } = {}) => {
  const provider = new MockedProvider({
    mocks: [
      {
        request: {
          query: STATS_QUERY,
        },
        result: failStats
          ? undefined
          : {
              data: {
                statistics: {
                  __typename: 'Statistics',
                  ...MOCK_STATISTICS_QUERY_RESULT,
                },
              },
            },
      },
      {
        request: {
          query: TIME_UPDATE_SUBSCRIPTION,
        },
        result: failSubscription
          ? undefined
          : {
              data: {
                busEvents: {
                  eventId: 'time-0',
                },
              },
            },
      },
    ],
  });

  return provider.state.client;
};

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

afterAll(() => {
  // @ts-ignore allow deleting the spy function after we're done with the tests
  delete window.performance.getEntriesByName;
});

describe('useNode hook', () => {
  it('returns the default state when no arguments provided', () => {
    const { result } = renderHook(() => useNode());
    expect(result.current.state).toEqual(initialState);
  });

  it('returns the default state when no url provided', () => {
    const client = createMockClient();
    const { result } = renderHook(() => useNode(undefined, client));
    expect(result.current.state).toEqual(initialState);
  });

  it('returns the default state when no client provided', () => {
    const url = 'https://some.url';
    const { result } = renderHook(() => useNode(url, undefined));
    expect(result.current.state).toEqual({ ...initialState, url });
  });

  it('sets loading state while waiting for the results', async () => {
    const url = 'https://some.url';
    const client = createMockClient();
    const { result, waitForNextUpdate } = renderHook(() =>
      useNode(url, client)
    );

    expect(result.current.state).toEqual({
      url,
      responseTime: {
        isLoading: true,
        hasError: false,
        value: undefined,
      },
      block: {
        isLoading: true,
        hasError: false,
        value: undefined,
      },
      ssl: {
        isLoading: true,
        hasError: false,
        value: undefined,
      },
      chain: {
        isLoading: true,
        hasError: false,
        value: undefined,
      },
    });

    await waitForNextUpdate();
  });

  it('sets statistics results', async () => {
    const url = 'https://some.url';
    const client = createMockClient();
    const { result, waitFor } = renderHook(() => useNode(url, client));

    await waitFor(() => {
      expect(result.current.state.block).toEqual({
        isLoading: false,
        hasError: false,
        value: Number(MOCK_STATISTICS_QUERY_RESULT.blockHeight),
      });

      expect(result.current.state.chain).toEqual({
        isLoading: false,
        hasError: false,
        value: MOCK_STATISTICS_QUERY_RESULT.chainId,
      });

      expect(result.current.state.responseTime).toEqual({
        isLoading: false,
        hasError: false,
        value: MOCK_DURATION,
      });
    });
  });

  it('sets subscription result', async () => {
    const url = 'https://some.url';
    const client = createMockClient();
    const { result, waitFor } = renderHook(() => useNode(url, client));

    await waitFor(() => {
      expect(result.current.state.ssl).toEqual({
        isLoading: false,
        hasError: false,
        value: true,
      });
    });
  });

  it('sets error when statistics request fails', async () => {
    const url = 'https://some.url';
    const client = createMockClient({ failStats: true });
    const { result, waitFor } = renderHook(() => useNode(url, client));

    await waitFor(() => {
      expect(result.current.state.block).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state.chain).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state.responseTime).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('sets error when subscription request fails', async () => {
    const url = 'https://some.url';
    const client = createMockClient({ failSubscription: true });
    const { result, waitFor } = renderHook(() => useNode(url, client));

    await waitFor(() => {
      expect(result.current.state.ssl).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('allows updating block values', async () => {
    const url = 'https://some.url';
    const client = createMockClient({ failSubscription: true });
    const { result, waitFor } = renderHook(() => useNode(url, client));

    await waitFor(() => {
      expect(result.current.state.block.value).toEqual(11);
    });

    act(() => {
      result.current.updateBlockState(12);
    });

    await waitFor(() => {
      expect(result.current.state.block.value).toEqual(12);
    });
  });

  it('allows resetting the state to defaults', async () => {
    const url = 'https://some.url';
    const client = createMockClient();
    const { result, waitFor } = renderHook(() => useNode(url, client));

    await waitFor(() => {
      expect(result.current.state.block.value).toBe(
        Number(MOCK_STATISTICS_QUERY_RESULT.blockHeight)
      );
      expect(result.current.state.chain.value).toBe(
        MOCK_STATISTICS_QUERY_RESULT.chainId
      );
      expect(result.current.state.responseTime.value).toBe(MOCK_DURATION);
      expect(result.current.state.ssl.value).toBe(true);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({ ...initialState, url });
  });
});
