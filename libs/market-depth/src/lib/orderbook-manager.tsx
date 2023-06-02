import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketDepthProvider } from './market-depth-provider';
import type { MarketData } from '@vegaprotocol/markets';
import { marketDataProvider, marketProvider } from '@vegaprotocol/markets';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  MarketDepthQuery,
  MarketDepthQueryVariables,
  MarketDepthUpdateSubscription,
  PriceLevelFieldsFragment,
} from './__generated__/MarketDepth';
import type { OrderbookData } from './orderbook-data';
import {
  compactTypedRows,
  updateCompactedRowsByType,
  VolumeType,
} from './orderbook-data';
import { useOrderStore } from '@vegaprotocol/orders';

interface OrderbookManagerProps {
  marketId: string;
}

export const OrderbookManager = ({ marketId }: OrderbookManagerProps) => {
  const [resolution, setResolution] = useState(1);
  const variables = { marketId };
  const [orderbookData, setOrderbookData] = useState<OrderbookData>({
    asks: null,
    bids: null,
  });
  const dataRef = useRef<OrderbookData>({ asks: null, bids: null });
  const deltaRef = useRef<{
    sell: PriceLevelFieldsFragment[];
    buy: PriceLevelFieldsFragment[];
  }>({
    sell: [],
    buy: [],
  });
  const updateOrderbookData = useRef(
    throttle(() => {
      dataRef.current = {
        asks: deltaRef.current.buy.length
          ? updateCompactedRowsByType(
              dataRef.current.asks ?? [],
              deltaRef.current.sell,
              resolution,
              VolumeType.ask
            )
          : dataRef.current.asks,
        bids: deltaRef.current.sell.length
          ? updateCompactedRowsByType(
              dataRef.current.bids ?? [],
              deltaRef.current.buy,
              resolution,
              VolumeType.bid
            )
          : dataRef.current.bids,
      };
      deltaRef.current.buy = [];
      deltaRef.current.sell = [];
      setOrderbookData(dataRef.current);
    }, 250)
  );

  useEffect(() => {
    deltaRef.current.buy = [];
    deltaRef.current.sell = [];
  }, [marketId]);

  const update = useCallback(
    ({
      delta: deltas,
    }: {
      delta?: MarketDepthUpdateSubscription['marketsDepthUpdate'] | null;
      // data: NonNullable<MarketDepthQuery['market']> | null | undefined;
    }) => {
      if (!dataRef.current.asks && !dataRef.current.bids) {
        return false;
      }
      for (const delta of deltas || []) {
        if (delta.marketId !== marketId) {
          continue;
        }
        if (delta.sell) {
          deltaRef.current.sell.push(...delta.sell);
        }
        if (delta.buy) {
          deltaRef.current.buy.push(...delta.buy);
        }
      }
      updateOrderbookData.current();
      return true;
    },
    [marketId, updateOrderbookData]
  );

  const { data, error, loading, flush, reload } = useDataProvider<
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
    const throttleRunner = updateOrderbookData.current;
    if (!data) {
      dataRef.current = { bids: null, asks: null };
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = {
      bids: compactTypedRows(data.depth.buy, VolumeType.bid, resolution),
      asks: compactTypedRows(data.depth.sell, VolumeType.ask, resolution),
    };
    setOrderbookData(dataRef.current);

    return () => {
      throttleRunner.cancel();
    };
  }, [data, resolution]);

  const updateOrder = useOrderStore((store) => store.update);

  const handleResolutionChange = useCallback(
    (resolution: number) => {
      setResolution(resolution);
      flush();
    },
    [setResolution, flush]
  );



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
        resolution={resolution}
        onResolutionChange={handleResolutionChange}
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
