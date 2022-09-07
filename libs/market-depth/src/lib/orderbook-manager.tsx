import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import marketDepthProvider from './market-depth-data-provider';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import type { MarketData } from '@vegaprotocol/market-list';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MarketDepthSubscription_marketsDepthUpdate } from './__generated__/MarketDepthSubscription';
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
  const deltaRef = useRef<MarketDepthSubscription_marketsDepthUpdate>();
  const updateOrderbookData = useRef(
    throttle(() => {
      if (!deltaRef.current) {
        return;
      }
      dataRef.current = {
        ...marketDataRef.current,
        ...mapMarketData(marketDataRef.current, resolutionRef.current),
        rows: updateCompactedRows(
          dataRef.current.rows ?? [],
          deltaRef.current.sell,
          deltaRef.current.buy,
          resolutionRef.current
        ),
      };
      deltaRef.current = undefined;
      setOrderbookData(dataRef.current);
    }, 1000)
  );

  const update = useCallback(
    ({ delta }: { delta: MarketDepthSubscription_marketsDepthUpdate }) => {
      if (!dataRef.current.rows) {
        return false;
      }
      if (deltaRef.current) {
        if (delta.sell) {
          if (deltaRef.current.sell) {
            deltaRef.current.sell.push(...delta.sell);
          } else {
            deltaRef.current.sell = delta.sell;
          }
        }
        if (delta.buy) {
          if (deltaRef.current.buy) {
            deltaRef.current.buy.push(...delta.buy);
          } else {
            deltaRef.current.buy = delta.buy;
          }
        }
      } else {
        deltaRef.current = delta;
      }
      updateOrderbookData.current();
      return true;
    },
    // using resolutionRef.current to avoid using resolution as a dependency - it will cause data provider restart on resolution change
    []
  );

  const { data, error, loading, flush } = useDataProvider({
    dataProvider: marketDepthProvider,
    update: () => true,
    variables,
  });

  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useDataProvider({
    dataProvider: marketProvider,
    update: () => true,
    variables,
  });

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
  } = useDataProvider({
    dataProvider: marketDataProvider,
    update: ({ data }) => {
      marketDataRef.current = data;
      return true;
    },
    variables,
  });

  marketDataRef.current = marketData;

  useEffect(() => {
    const throttleRunnner = updateOrderbookData.current;
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
      throttleRunnner.cancel();
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
      />
    </AsyncRenderer>
  );
};
