import type { v2GetOrderResponse } from '@vegaprotocol/rest-clients/dist/trading-data';
import { useCallback, useEffect, useState } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useNetwork } from '@/contexts/network/network-context';
import { RpcMethods } from '@/lib/client-rpc-methods';

import { useAsyncAction } from '../async-action';

/**
 * Hook to load an order by ID. This is not implemented as a store because orders are only required for receipts
 * They are not used through the rest of the application and we do not need to keep them in memory
 * Having a store that is a singleton would mean that we would have to reset the state every time we use it
 * and that opens up race conditions
 * @param orderId
 */
export const useOrder = (orderId: string) => {
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const { request } = useJsonRpcClient();
  const loadOrder = useCallback(async () => {
    const response = await request(
      RpcMethods.Fetch,
      { path: `api/v2/order/${orderId}` },
      true
    );
    const { order } = response as v2GetOrderResponse;
    setLastUpdated(Date.now());
    return order;
  }, [orderId, request]);
  const { loaderFunction, ...rest } = useAsyncAction(loadOrder);
  useEffect(() => {
    if (orderId) {
      loaderFunction();
    }
  }, [loaderFunction, orderId]);
  return {
    ...rest,
    lastUpdated,
  };
};
