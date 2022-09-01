import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import {
  compactRows,
  updateCompactedRows,
  mapMarketData,
} from './orderbook-data';
import dataProvider from './market-depth-data-provider';
import type { OrderbookData } from './orderbook-data';
import type { MarketDepthSubscription_marketDepthUpdate } from './__generated__/MarketDepthSubscription';

interface Props {
  variables: { marketId: string };
  resolution: number;
  throttleMilliseconds?: number;
}

export const useOrderBookData = ({
  variables,
  resolution,
  throttleMilliseconds = 1000,
}: Props) => {
  const [orderbookData, setOrderbookData] = useState<OrderbookData>({
    rows: null,
  });
  const resolutionRef = useRef(resolution);
  const dataRef = useRef<OrderbookData>({ rows: null });
  const deltaRef = useRef<MarketDepthSubscription_marketDepthUpdate>();
  const updateOrderbookData = useRef(
    throttle(() => {
      if (!deltaRef.current) {
        return;
      }
      dataRef.current = {
        ...deltaRef.current.market.data,
        ...mapMarketData(deltaRef.current.market.data, resolutionRef.current),
        rows: updateCompactedRows(
          dataRef.current.rows ?? [],
          deltaRef.current.sell,
          deltaRef.current.buy,
          resolutionRef.current
        ),
      };
      deltaRef.current = undefined;
      setOrderbookData(dataRef.current);
    }, throttleMilliseconds)
  );

  const update = useCallback(
    ({ delta }: { delta: MarketDepthSubscription_marketDepthUpdate }) => {
      if (!dataRef.current.rows) {
        return false;
      }
      if (deltaRef.current) {
        deltaRef.current.market = delta.market;
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
    dataProvider,
    update,
    variables,
  });

  useEffect(() => {
    const throttleRunnner = updateOrderbookData.current;
    if (!data) {
      dataRef.current = { rows: null };
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = {
      ...data.data,
      rows: compactRows(data.depth.sell, data.depth.buy, resolution),
      ...mapMarketData(data.data, resolution),
    };
    setOrderbookData(dataRef.current);

    return () => {
      throttleRunnner.cancel();
    };
  }, [data, resolution]);

  useEffect(() => {
    resolutionRef.current = resolution;
    flush();
  }, [resolution, flush]);

  const dataProps = useMemo(
    () => ({
      loading,
      error,
      data,
    }),
    [data, loading, error]
  );

  return {
    ...dataProps,
    orderbookData,
  };
};
