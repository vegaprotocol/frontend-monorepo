import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { isOrderActive, ordersWithMarketProvider } from '@vegaprotocol/orders';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';

export const useRequestClosePositionData = (
  marketId?: string,
  partyId?: string
) => {
  const { data: market } = useDataProvider({
    dataProvider: marketProvider,
    variables: { marketId },
    skip: !marketId,
  });
  const { data: marketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId },
  });
  const { data: orderData } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables: { partyId },
  });

  const orders = useMemo(() => {
    if (!orderData || !market) return [];
    return orderData
      .filter((o) => {
        // Filter out orders not on market for position
        if (!o.node.market || o.node.market.id !== market.id) {
          return false;
        }

        if (!isOrderActive(o.node.status)) {
          return false;
        }

        return true;
      })
      .map((o) => o.node);
  }, [orderData, market]);

  return { market, marketData, orders };
};
