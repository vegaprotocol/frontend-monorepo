import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketDepthProvider } from './market-depth-provider';
import type { MarketData } from '@vegaprotocol/markets';
import { marketDataProvider, marketProvider } from '@vegaprotocol/markets';
import { useCallback, useEffect, useState } from 'react';
import type {
  MarketDepthQuery,
  MarketDepthQueryVariables,
  MarketDepthUpdateSubscription,
  PriceLevelFieldsFragment,
} from './__generated__/MarketDepth';
import { VolumeType, fillSubscriptionData } from './orderbook-data';
import { useOrderStore } from '@vegaprotocol/orders';

export type OrderbookData = {
  asks: PriceLevelFieldsFragment[];
  bids: PriceLevelFieldsFragment[];
};

interface OrderbookManagerProps {
  marketId: string;
}

export const OrderbookManager = ({ marketId }: OrderbookManagerProps) => {
  const variables = { marketId };
  const [orderbookData, setOrderBookData] = useState<OrderbookData>({
    asks: [],
    bids: [],
  });

  const initialDataSort = useCallback((data?: MarketDepthQuery['market']) => {
    const bids = (data?.depth.buy || []).filter((item) => item.volume !== '0');
    const asks = (data?.depth.sell || []).filter((item) => item.volume !== '0');
    return { asks, bids };
  }, []);
  const updateOrderbookData = useCallback(
    (
      deltaSell: PriceLevelFieldsFragment[],
      deltaBuy: PriceLevelFieldsFragment[],
      data: MarketDepthQuery['market']
    ) => {
      const orderbookData = initialDataSort(data);
      const asks = fillSubscriptionData(
        orderbookData.asks,
        deltaSell,
        VolumeType.ask
      );
      const bids = fillSubscriptionData(
        orderbookData.bids,
        deltaBuy,
        VolumeType.bid
      );
      setOrderBookData({ asks, bids });
    },
    [initialDataSort]
  );

  const update = useCallback(
    ({
      delta: deltas,
      data,
    }: {
      delta?: MarketDepthUpdateSubscription['marketsDepthUpdate'] | null;
      data?: MarketDepthQuery['market'];
    }) => {
      const deltaSell = [];
      const deltaBuy = [];
      for (const delta of deltas || []) {
        if (delta.marketId !== marketId) {
          continue;
        }
        if (delta.sell) {
          deltaSell.push(...delta.sell);
        }
        if (delta.buy) {
          deltaBuy.push(...delta.buy);
        }
      }
      updateOrderbookData(deltaSell, deltaBuy, data);
      return true;
    },
    [marketId, updateOrderbookData]
  );

  const { data, error, loading, reload } = useDataProvider<
    MarketDepthQuery['market'] | undefined,
    MarketDepthUpdateSubscription['marketsDepthUpdate'] | null,
    MarketDepthQueryVariables
  >({
    dataProvider: marketDepthProvider,
    update,
    variables,
  });

  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useDataProvider({
    dataProvider: marketProvider,
    skipUpdates: true,
    variables,
  });

  const marketDataUpdate = useCallback(
    ({ data }: { data: MarketData | null }) => {
      setMarkPrice(data?.markPrice || '');
      return true;
    },
    []
  );

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
  } = useDataProvider({
    dataProvider: marketDataProvider,
    update: marketDataUpdate,
    variables,
  });

  const [markPrice, setMarkPrice] = useState(marketData?.markPrice || '');

  useEffect(() => {
    const sorted = initialDataSort(data);
    setOrderBookData(sorted);
  }, [initialDataSort, data]);

  const updateOrder = useOrderStore((store) => store.update);

  return (
    <AsyncRenderer
      loading={loading || marketDataLoading || marketLoading}
      error={error || marketDataError || marketError}
      data={data}
      reload={reload}
    >
      <Orderbook
        {...orderbookData}
        decimalPlaces={market?.decimalPlaces ?? 0}
        positionDecimalPlaces={market?.positionDecimalPlaces ?? 0}
        onClick={(price: string) => {
          if (price) {
            updateOrder(marketId, { price });
          }
        }}
        markPrice={markPrice}
      />
    </AsyncRenderer>
  );
};
