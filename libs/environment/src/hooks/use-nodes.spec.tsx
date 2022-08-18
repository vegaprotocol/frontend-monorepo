import { renderHook, act } from '@testing-library/react';
import { ApolloClient } from '@apollo/client';
import createClient from '../utils/apollo-client';
import { useNodes } from './use-nodes';
import createMockClient, {
  getMockStatisticsResult,
} from './mocks/apollo-client';
import { waitFor } from '@testing-library/react';

jest.mock('../utils/apollo-client');

const MOCK_DURATION = 1073;

const initialState = {
  url: '',
  initialized: false,
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
  createClient.mockImplementation(() => createMockClient());
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('useNodes hook', () => {
  it('returns the default state when empty config provided', () => {
    const { result } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state).toEqual({});
  });

  it('sets loading state while waiting for the results', async () => {
    const node = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    expect(result.current.state[node]).toEqual({
      ...initialState,
      url: node,
      initialized: true,
      responseTime: {
        ...initialState.responseTime,
        isLoading: true,
      },
      block: {
        ...initialState.block,
        isLoading: true,
      },
      chain: {
        ...initialState.chain,
        isLoading: true,
      },
      ssl: {
        ...initialState.ssl,
        isLoading: true,
      },
    });
  });

  it('sets statistics results', async () => {
    const mockResult = getMockStatisticsResult();
    const node = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    await waitFor(() => {
      expect(result.current.state[node].block).toEqual({
        isLoading: false,
        hasError: false,
        value: Number(mockResult.statistics.blockHeight),
      });

      expect(result.current.state[node].chain).toEqual({
        isLoading: false,
        hasError: false,
        value: mockResult.statistics.chainId,
      });

      expect(result.current.state[node].responseTime).toEqual({
        isLoading: false,
        hasError: false,
        value: MOCK_DURATION,
      });
    });
  });

  it('sets subscription result', async () => {
    const node = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    await waitFor(() => {
      expect(result.current.state[node].ssl).toEqual({
        isLoading: false,
        hasError: false,
        value: true,
      });
    });
  });

  it('sets error when host in not a valid url', async () => {
    const node = 'not-url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    await waitFor(() => {
      expect(result.current.state[node].block.hasError).toBe(true);
      expect(result.current.state[node].chain.hasError).toBe(true);
      expect(result.current.state[node].responseTime.hasError).toBe(true);
      expect(result.current.state[node].responseTime.hasError).toBe(true);
    });
  });

  it('sets error when statistics request fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockImplementation(() =>
      createMockClient({ statistics: { hasError: true } })
    );

    const node = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    await waitFor(() => {
      expect(result.current.state[node].block).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[node].chain).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[node].responseTime).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('sets error when subscription request fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockImplementation(() =>
      createMockClient({ busEvents: { hasError: true } })
    );

    const node = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    await waitFor(() => {
      expect(result.current.state[node].ssl).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('allows updating block values', async () => {
    const mockResult = getMockStatisticsResult();
    const node = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    await waitFor(() => {
      expect(result.current.state[node].block.value).toEqual(
        Number(mockResult.statistics.blockHeight)
      );
    });

    act(() => {
      result.current.updateNodeBlock(node, 12);
    });

    await waitFor(() => {
      expect(result.current.state[node].block.value).toEqual(12);
    });
  });

  it('does nothing when calling the block update on a non-existing node', async () => {
    const mockResult = getMockStatisticsResult();
    const node = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    await waitFor(() => {
      expect(result.current.state[node].block.value).toEqual(
        Number(mockResult.statistics.blockHeight)
      );
    });

    act(() => {
      result.current.updateNodeBlock('https://non-existing.url', 12);
    });

    expect(result.current.state['https://non-existing.url']).toBe(undefined);
  });

  it('adds new node', async () => {
    const node = 'custom-node-key';
    const { result } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[node]).toEqual(undefined);

    act(() => {
      result.current.addNode(node);
    });

    await waitFor(() => {
      expect(result.current.state[node]).toEqual(initialState);
    });
  });

  it('sets new url for node', async () => {
    const node = 'https://some.url';
    const newUrl = 'https://some-other.url';
    const { result } = renderHook(() => useNodes({ hosts: [node] }));

    act(() => {
      result.current.updateNodeUrl(node, newUrl);
    });

    await waitFor(() => {
      expect(result.current.state[node].url).toBe(newUrl);
    });
  });

  it('sets error when custom node has an invalid url', async () => {
    const node = 'node-key';
    const url = 'not-url';
    const { result } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[node]).toBe(undefined);

    act(() => {
      result.current.updateNodeUrl(node, url);
    });

    await waitFor(() => {
      expect(result.current.state[node].url).toBe(url);
      expect(result.current.state[node].block.hasError).toBe(true);
      expect(result.current.state[node].chain.hasError).toBe(true);
      expect(result.current.state[node].responseTime.hasError).toBe(true);
      expect(result.current.state[node].ssl.hasError).toBe(true);
    });
  });

  it('sets error when custom node statistics request fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockImplementation(() =>
      createMockClient({ statistics: { hasError: true } })
    );

    const node = 'node-key';
    const url = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[node]).toBe(undefined);

    act(() => {
      result.current.updateNodeUrl(node, url);
    });

    await waitFor(() => {
      expect(result.current.state[node].block).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[node].chain).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });

      expect(result.current.state[node].responseTime).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('sets error when custom node subscription fails', async () => {
    // @ts-ignore allow adding a mock return value to mocked module
    createClient.mockImplementation(() =>
      createMockClient({ busEvents: { hasError: true } })
    );

    const node = 'node-key';
    const url = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [] }));

    expect(result.current.state[node]).toBe(undefined);

    act(() => {
      result.current.updateNodeUrl(node, url);
    });

    await waitFor(() => {
      expect(result.current.state[node].ssl).toEqual({
        isLoading: false,
        hasError: true,
        value: undefined,
      });
    });
  });

  it('exposes a collection of clients', async () => {
    const url1 = 'https://some.url';
    const url2 = 'https://some-other.url';
    const { result } = renderHook(() => useNodes({ hosts: [url1, url2] }));

    await waitFor(() => {
      expect(result.current.clients[url1]).toBeInstanceOf(ApolloClient);
      expect(result.current.clients[url2]).toBeInstanceOf(ApolloClient);
    });
  });

  it('exposes a client for the custom node', async () => {
    const node = 'node-key';
    const url = 'https://some.url';
    const { result } = renderHook(() => useNodes({ hosts: [] }));

    act(() => {
      result.current.updateNodeUrl(node, url);
    });

    await waitFor(() => {
      expect(result.current.clients[url]).toBeInstanceOf(ApolloClient);
    });
  });
});
