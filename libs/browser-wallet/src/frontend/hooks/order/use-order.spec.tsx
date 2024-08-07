import { renderHook, waitFor } from '@testing-library/react';

import { RpcMethods } from '@/lib/client-rpc-methods';

import { useOrder } from './use-order';

const MOCK_REQUEST = jest.fn().mockResolvedValue({ order: {} });

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: MOCK_REQUEST,
  }),
}));

jest.mock('@/contexts/network/network-context', () => ({
  useNetwork: () => ({
    network: { id: 'networkId' },
  }),
}));

describe('useOrder', () => {
  it('should return last updated and order', async () => {
    const view = renderHook(() => useOrder('orderId'));
    expect(view.result.current.lastUpdated).toBeNull();
    jest.clearAllTimers();
    await waitFor(() => expect(view.result.current.lastUpdated).not.toBeNull());
    expect(view.result.current.lastUpdated).toBeGreaterThan(0);
    expect(view.result.current.data).toEqual({});
    expect(MOCK_REQUEST).toHaveBeenCalledWith(
      RpcMethods.Fetch,
      { path: 'api/v2/order/orderId', networkId: 'networkId' },
      true
    );
    expect(MOCK_REQUEST).toHaveBeenCalledTimes(1);
  });
});
