import { renderHook, act } from '@testing-library/react-hooks';
import { MockedProvider } from '@apollo/client/testing';
import { ApolloClient } from '@apollo/client';
import createClient from '../utils/apollo-client';
import { CUSTOM_NODE_KEY } from '../types';

import {
  STATS_QUERY,
  TIME_UPDATE_SUBSCRIPTION,
} from '../utils/initialize-node';
import { useNodes } from './use-nodes';

jest.mock('../utils/apollo-client');

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

beforeEach(() => {
  // @ts-ignore allow adding a mock return value to mocked module
  createClient.mockReturnValue(createMockClient());
});

afterAll(() => {
  // @ts-ignore allow deleting the spy function after we're done with the tests
  delete window.performance.getEntriesByName;
});

describe('useNodes hook', () => {
  it('returns the default state when empty config provided', () => {
    const { result } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state).toEqual({
      custom: initialState,
    });
  });

  it('sets loading state while waiting for the results', async () => {
    const url = 'https://some.url';
    const { result, waitForNextUpdate } = renderHook(() =>
      useNodes({ hosts: [url] })
    );

    expect(result.current.state[url]).toEqual({
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
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [url] }));

    await waitFor(() => {
      expect(result.current.state[url].block).toEqual({
        isLoading: false,
        hasError: false,
        value: Number(MOCK_STATISTICS_QUERY_RESULT.blockHeight),
      });

      expect(result.current.state[url].chain).toEqual({
        isLoading: false,
        hasError: false,
        value: MOCK_STATISTICS_QUERY_RESULT.chainId,
      });

      expect(result.current.state[url].responseTime).toEqual({
        isLoading: false,
        hasError: false,
        value: MOCK_DURATION,
      });
    });
  });

  it('sets subscription result', async () => {
    const url = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [url] }));

    await waitFor(() => {
      expect(result.current.state[url].ssl).toEqual({
        isLoading: false,
        hasError: false,
        value: true,
      });
    });
  });

  it('sets error when host in not a valid url', async () => {
    const url = 'not-url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [url] }));

    await waitFor(() => {
      expect(result.current.state[url].block.hasError).toBe(true);
      expect(result.current.state[url].chain.hasError).toBe(true);
      expect(result.current.state[url].responseTime.hasError).toBe(true);
      expect(result.current.state[url].responseTime.hasError).toBe(true);
    });
  });

  it('sets error when statistics request fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockReturnValue(createMockClient({ failStats: true }));

    const url = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [url] }));

    await waitFor(() => {
      expect(result.current.state[url].block).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[url].chain).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[url].responseTime).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('sets error when subscription request fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockReturnValue(createMockClient({ failSubscription: true }));

    const url = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [url] }));

    await waitFor(() => {
      expect(result.current.state[url].ssl).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('allows updating block values', async () => {
    const url = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [url] }));

    await waitFor(() => {
      expect(result.current.state[url].block.value).toEqual(
        Number(MOCK_STATISTICS_QUERY_RESULT.blockHeight)
      );
    });

    act(() => {
      result.current.updateNodeBlock(url, 12);
    });

    await waitFor(() => {
      expect(result.current.state[url].block.value).toEqual(12);
    });
  });

  it('does nothing when calling the block update on a non-existing node', async () => {
    const url = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [url] }));

    await waitFor(() => {
      expect(result.current.state[url].block.value).toEqual(
        Number(MOCK_STATISTICS_QUERY_RESULT.blockHeight)
      );
    });

    act(() => {
      result.current.updateNodeBlock('https://non-existing.url', 12);
    });

    expect(result.current.state['https://non-existing.url']).toBe(undefined);
  });

  it('sets custom node and client', async () => {
    const customUrl = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[CUSTOM_NODE_KEY]).toEqual(initialState);

    act(() => {
      result.current.setCustomNode(customUrl);
    });

    await waitFor(() => {
      expect(result.current.state[CUSTOM_NODE_KEY].block.value).toEqual(
        Number(MOCK_STATISTICS_QUERY_RESULT.blockHeight)
      );
      expect(result.current.state[CUSTOM_NODE_KEY].chain.value).toEqual(
        MOCK_STATISTICS_QUERY_RESULT.chainId
      );
      expect(result.current.state[CUSTOM_NODE_KEY].responseTime.value).toEqual(
        MOCK_DURATION
      );
      expect(result.current.state[CUSTOM_NODE_KEY].ssl.value).toEqual(true);
    });
  });

  it('sets error when custom node has an invalid url', async () => {
    const customUrl = 'not-url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[CUSTOM_NODE_KEY]).toEqual(initialState);

    act(() => {
      result.current.setCustomNode(customUrl);
    });

    await waitFor(() => {
      expect(result.current.state[CUSTOM_NODE_KEY].url).toBe(customUrl);
      expect(result.current.state[CUSTOM_NODE_KEY].block.hasError).toBe(true);
      expect(result.current.state[CUSTOM_NODE_KEY].chain.hasError).toBe(true);
      expect(result.current.state[CUSTOM_NODE_KEY].responseTime.hasError).toBe(
        true
      );
      expect(result.current.state[CUSTOM_NODE_KEY].ssl.hasError).toBe(true);
    });
  });

  it('sets error when custom node statistics request fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockReturnValue(createMockClient({ failStats: true }));

    const customUrl = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[CUSTOM_NODE_KEY]).toEqual(initialState);

    act(() => {
      result.current.setCustomNode(customUrl);
    });

    await waitFor(() => {
      expect(result.current.state[CUSTOM_NODE_KEY].block).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[CUSTOM_NODE_KEY].chain).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[CUSTOM_NODE_KEY].responseTime).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('sets error when custom node subscription fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockReturnValue(createMockClient({ failSubscription: true }));

    const customUrl = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[CUSTOM_NODE_KEY]).toEqual(initialState);

    act(() => {
      result.current.setCustomNode(customUrl);
    });

    await waitFor(() => {
      expect(result.current.state[CUSTOM_NODE_KEY].ssl).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('exposes a collection of clients', async () => {
    const url1 = 'https://some.url';
    const url2 = 'https://some-other.url';
    const { result, waitFor } = renderHook(() =>
      useNodes({ hosts: [url1, url2] })
    );

    await waitFor(() => {
      expect(result.current.clients[url1]).toBeInstanceOf(ApolloClient);
      expect(result.current.clients[url2]).toBeInstanceOf(ApolloClient);
    });
  });

  it('exposes a client for the custom node', async () => {
    const customUrl = 'https://some.url';
    const { result, waitFor } = renderHook(() => useNodes({ hosts: [] }));

    act(() => {
      result.current.setCustomNode(customUrl);
    });

    await waitFor(() => {
      expect(result.current.clients[CUSTOM_NODE_KEY]).toBeInstanceOf(
        ApolloClient
      );
    });
  });
});
