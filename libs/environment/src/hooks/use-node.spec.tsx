import { renderHook } from '@testing-library/react-hooks';
import { MockedProvider } from '@apollo/client/testing';

import { useNode, STATS_QUERY } from './use-node';

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
}

const createMockClient = (queryData: any) => {
  const provider = new MockedProvider({
    mocks: [{
      request: {
        query: STATS_QUERY,
      },
      result: {
        data: {
          statistics: queryData,
        }
      },
    }]
  });

  return provider.state.client;
};

describe('useNode hook', () => {
  it('returns the default state when no arguments provided', () => {
    const { result } = renderHook(() => useNode());
    expect(result.current.state).toEqual(initialState);
  });

  it('returns the default state when no url provided', () => {
    const client = createMockClient({});
    const { result } = renderHook(() => useNode(undefined, client));
    expect(result.current).toEqual(initialState);
  });

  it('returns the default state when no client provided', () => {
    const { result } = renderHook(() => useNode('https://some.url', undefined));
    expect(result.current).toEqual(initialState);
  });
  // 
  // it('allows updating block values', () => {
  //
  // });
  //
  // it('allows resetting the state to defaults', () => {
  //
  // });
});
