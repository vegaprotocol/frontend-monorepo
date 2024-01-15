import { renderHook, waitFor } from '@testing-library/react';
import { MAX_FETCH_ATTEMPTS, useChainId } from './use-chain-id';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;
mockFetch.mockImplementation((url: string) => {
  return Promise.resolve({ ok: true });
});

describe('useChainId', () => {
  it('does not call fetch when statistics url could not be determined', async () => {
    renderHook(() => useChainId(''));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });

  it('calls fetch with correct statistics url', async () => {
    renderHook(() => useChainId('http://localhost:1234/graphql'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:1234/statistics'
      );
    });
  });

  it('does not return chain id when chain id is not present in response', async () => {
    const { result } = renderHook(() =>
      useChainId('http://localhost:1234/graphql')
    );
    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });

  it('returns chain id when chain id is present in response', async () => {
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => ({
          statistics: {
            chainId: '1234',
          },
        }),
      });
    });
    const { result } = renderHook(() =>
      useChainId('http://localhost:1234/graphql')
    );
    await waitFor(() => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual('1234');
    });
  });

  it('returns chain id when within max number of attempts', async () => {
    mockFetch.mockImplementation(() => {
      if (mockFetch.mock.calls.length < MAX_FETCH_ATTEMPTS) {
        return Promise.reject();
      }
      return Promise.resolve({
        ok: true,
        json: () => ({
          statistics: {
            chainId: '1234',
          },
        }),
      });
    });
    const { result } = renderHook(() =>
      useChainId('http://localhost:1234/graphql')
    );
    await waitFor(() => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual('1234');
    });
  });

  it('does not return chain id when max number of attempts exceeded', async () => {
    mockFetch.mockImplementation(() => {
      if (mockFetch.mock.calls.length < MAX_FETCH_ATTEMPTS + 10) {
        return Promise.reject();
      }
      return Promise.resolve({
        ok: true,
        json: () => ({
          statistics: {
            chainId: '1234',
          },
        }),
      });
    });
    const { result } = renderHook(() =>
      useChainId('http://localhost:5678/graphql')
    );
    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });
});
