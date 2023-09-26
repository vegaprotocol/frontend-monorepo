import { renderHook, waitFor } from '@testing-library/react';
import { JsonRpcConnector } from './connectors';
import { useIsWalletServiceRunning } from './use-is-wallet-service-running';

describe('useIsWalletServiceRunning', () => {
  it('returns true if wallet is running', async () => {
    const url = 'https://foo.bar.com';
    const connector = new JsonRpcConnector();
    const spyOnCheckCompat = jest
      .spyOn(connector, 'checkCompat')
      .mockResolvedValue(true);
    const { result } = renderHook(() =>
      useIsWalletServiceRunning(url, connector)
    );

    expect(result.current).toBe(null);

    await waitFor(() => {
      expect(spyOnCheckCompat).toHaveBeenCalled();
      expect(result.current).toBe(true);
    });
  });

  it('returns false if wallet is not running', async () => {
    const url = 'https://foo.bar.com';
    const connector = new JsonRpcConnector();
    const spyOnCheckCompat = jest
      .spyOn(connector, 'checkCompat')
      .mockRejectedValue(false);
    const { result } = renderHook(() =>
      useIsWalletServiceRunning(url, connector)
    );

    expect(result.current).toBe(null);

    await waitFor(() => {
      expect(spyOnCheckCompat).toHaveBeenCalled();
      expect(result.current).toBe(false);
    });
  });
});
