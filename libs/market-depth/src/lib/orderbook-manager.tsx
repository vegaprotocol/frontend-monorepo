import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { addDecimal, useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthProvider } from './market-depth-provider';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import type { MarketData } from '@vegaprotocol/market-list';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  MarketDepthUpdateSubscription,
  PriceLevelFieldsFragment,
} from './__generated__/MarketDepth';
import {
  compactRows,
  updateCompactedRows,
  mapMarketData,
} from './orderbook-data';
import type { OrderbookData } from './orderbook-data';

interface OrderbookManagerProps {
  marketId: string;
}

export const OrderbookManager = ({ marketId }: OrderbookManagerProps) => {
  const [resolution, setResolution] = useState(1);
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const resolutionRef = useRef(resolution);
  const [orderbookData, setOrderbookData] = useState<OrderbookData>({
    rows: null,
  });
  const dataRef = useRef<OrderbookData>({ rows: null });
  const marketDataRef = useRef<MarketData | null>(null);
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
        ...marketDataRef.current,
        ...mapMarketData(marketDataRef.current, resolutionRef.current),
        rows:
          deltaRef.current.buy.length || deltaRef.current.sell.length
            ? updateCompactedRows(
                dataRef.current.rows ?? [],
                deltaRef.current.sell,
                deltaRef.current.buy,
                resolutionRef.current
              )
            : dataRef.current.rows,
      };
      deltaRef.current.buy = [];
      deltaRef.current.sell = [];
      setOrderbookData(dataRef.current);
    }, 1000)
  );

  const update = useCallback(
    ({
      delta: deltas,
    }: {
      delta?: MarketDepthUpdateSubscription['marketsDepthUpdate'];
    }) => {
      if (!dataRef.current.rows) {
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
        updateOrderbookData.current();
      }
      return true;
    },
    [marketId, updateOrderbookData]
  );

  const { data, error, loading, flush } = useDataProvider({
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
      marketDataRef.current = data;
      updateOrderbookData.current();
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

  marketDataRef.current = marketData;

  useEffect(() => {
    const throttleRunner = updateOrderbookData.current;
    if (!marketDataRef.current) {
      return;
    }
    if (!data) {
      dataRef.current = { rows: null };
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = {
      ...marketDataRef.current,
      ...mapMarketData(marketDataRef.current, resolution),
      rows: compactRows(data.depth.sell, data.depth.buy, resolution),
    };
    setOrderbookData(dataRef.current);

    return () => {
      throttleRunner.cancel();
    };
  }, [data, marketData, resolution]);

  useEffect(() => {
    resolutionRef.current = resolution;
    flush();
  }, [resolution, flush]);

  return (
    <AsyncRenderer
      loading={loading || marketDataLoading || marketLoading}
      error={error || marketDataError || marketError}
      data={data}
    >
      <Orderbook
        {...orderbookData}
        decimalPlaces={market?.decimalPlaces ?? 0}
        positionDecimalPlaces={market?.positionDecimalPlaces ?? 0}
        resolution={resolution}
        onResolutionChange={(resolution: number) => setResolution(resolution)}
        onClick={(price?: string | number) => {
          if (price) {
            // console.log(
            //   'limitprice',
            //   addDecimal(price, market?.decimalPlaces ?? 0)
            // );
            document.dispatchEvent(
              new CustomEvent('limitprice', {
                detail: addDecimal(price, market?.decimalPlaces ?? 0),
              })
            );
          }
        }}
      />
    </AsyncRenderer>
  );
};
