import { renderHook, waitFor } from '@testing-library/react';
import { useVegaWallet } from '../use-vega-wallet';
import { useChainId } from './use-chain-id';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;
mockFetch.mockImplementation((url: string) => {
  return Promise.resolve({ ok: true });
});

jest.mock('../use-vega-wallet', () => {
  const original = jest.requireActual('../use-vega-wallet');
  return {
    ...original,
    useVegaWallet: jest.fn(),
  };
});

describe('useChainId', () => {
  it('does not call fetch when statistics url could not be determined', async () => {
    (useVegaWallet as jest.Mock).mockReturnValue({
      vegaUrl: '',
    });
    renderHook(() => useChainId());
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });

  it('calls fetch with correct statistics url', async () => {
    (useVegaWallet as jest.Mock).mockReturnValue({
      vegaUrl: 'http://localhost:1234/graphql',
    });
    renderHook(() => useChainId());
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:1234/statistics'
      );
    });
  });

  it('does not return chain id when chain id is not present in response', async () => {
    (useVegaWallet as jest.Mock).mockReturnValue({
      vegaUrl: 'http://localhost:1234/graphql',
    });
    const { result } = renderHook(() => useChainId());
    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });

  it('returns chain id when chain id is present in response', async () => {
    (useVegaWallet as jest.Mock).mockReturnValue({
      vegaUrl: 'http://localhost:1234/graphql',
    });
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
    const { result } = renderHook(() => useChainId());
    await waitFor(() => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual('1234');
    });
  });
});
