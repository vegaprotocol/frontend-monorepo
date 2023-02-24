import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { isOrderActive, ordersWithMarketProvider } from '@vegaprotocol/orders';
import type { OrdersQueryVariables } from '@vegaprotocol/orders';
import { useDataProvider } from '@vegaprotocol/utils';
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
    () => ({ partyId: partyId || '' }),
    [partyId]
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
    dataProvider: ordersWithMarketProvider,
    variables: orderVariables,
    skip: !partyId,
  });

  const orders = useMemo(() => {
    if (!orderData || !market) return [];
    return (
      orderData
        .filter((o) => {
          // Filter out orders not on market for position
          if (
            !o ||
            !o.node ||
            !o.node.market ||
            o.node.market.id !== market.id
          ) {
            return false;
          }

          if (!isOrderActive(o.node.status)) {
            return false;
          }

          return true;
        })
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
