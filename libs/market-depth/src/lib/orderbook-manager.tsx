import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import dataProvider from './market-depth-data-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MarketDepthEventSubscription } from './__generated__/MarketDepth';
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
  const deltaRef = useRef<MarketDepthEventSubscription['marketDepthUpdate']>();
  const updateOrderbookData = useRef(
    throttle(() => {
      if (!deltaRef.current) {
        return;
      }
      dataRef.current = {
        ...deltaRef.current.market.data,
        ...mapMarketData(deltaRef.current.market.data || null, resolutionRef.current),
        rows: updateCompactedRows(
          dataRef.current.rows ?? [],
          deltaRef.current.sell ?? null,
          deltaRef.current.buy ?? null,
          resolutionRef.current
        ),
      };
      deltaRef.current = undefined;
      setOrderbookData(dataRef.current);
    }, 1000)
  );

  const update = useCallback(
    ({ delta }: { delta: MarketDepthEventSubscription['marketDepthUpdate'] }) => {
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
      rows: compactRows(data.depth.sell ?? null, data.depth.buy ?? null, resolution),
      ...mapMarketData(data.data ?? null, resolution),
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

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <Orderbook
        {...orderbookData}
        decimalPlaces={data?.decimalPlaces ?? 0}
        positionDecimalPlaces={data?.positionDecimalPlaces ?? 0}
        resolution={resolution}
        onResolutionChange={(resolution: number) => setResolution(resolution)}
      />
    </AsyncRenderer>
  );
};
