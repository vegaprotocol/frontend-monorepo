import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { isOrderActive, ordersProvider } from '@vegaprotocol/orders';
import type { OrdersQueryVariables } from '@vegaprotocol/orders';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';

export const useRequestClosePositionData = (
  marketId?: string,
  partyId?: string
) => {
  const marketVariables = useMemo(
    () => ({ marketId: marketId || '' }),
    [marketId]
  );
  const orderVariables = useMemo<OrdersQueryVariables>(
    () => ({
      partyId: partyId || '',
      marketIds: marketId ? [marketId] : undefined,
    }),
    [partyId, marketId]
  );
  const { data: market, loading: marketLoading } = useDataProvider({
    dataProvider: marketProvider,
    variables: marketVariables,
    skip: !marketId,
  });
  const { data: marketData, loading: marketDataLoading } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: marketVariables,
  });
  const { data: orderData, loading: orderDataLoading } = useDataProvider({
    dataProvider: ordersProvider,
    variables: orderVariables,
    skip: !partyId,
  });

  const orders = useMemo(() => {
    if (!orderData || !market) return [];
    return (
      orderData
        .filter((o) => o?.node && isOrderActive(o.node.status))
        // @ts-ignore o is never null as its been filtered out above
        .map((o) => o.node)
    );
  }, [orderData, market]);

  return {
    market,
    marketData,
    orders,
    loading: marketLoading || marketDataLoading || orderDataLoading,
  };
};
