import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthDataProvider } from './market-depth-data-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MarketDepthSubscription_marketDepthUpdate } from './__generated__/MarketDepthSubscription';
import { compact, updateCompactedData } from './orderbook-data';
import type { OrderbookData } from './orderbook-data';

interface OrderbookManagerProps {
  marketId: string;
  resolution: number;
}

export const OrderbookManager = ({
  marketId,
  resolution,
}: OrderbookManagerProps) => {
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const resolutionRef = useRef(resolution);
  const lastUpdateRef = useRef(new Date().getTime());
  const [orderbookData, setOrderbookData] = useState<OrderbookData[] | null>(
    null
  );
  const dataRef = useRef<OrderbookData[] | null>(null);

  // Apply updates to the table
  const update = useCallback(
    (delta: MarketDepthSubscription_marketDepthUpdate) => {
      if (!dataRef.current) {
        return false;
      }
      dataRef.current = updateCompactedData(
        dataRef.current,
        delta.sell,
        delta.buy,
        resolutionRef.current
      );
      const now = new Date().getTime();
      if (now - lastUpdateRef.current > 1000) {
        setOrderbookData(dataRef.current);
        lastUpdateRef.current = now;
      }
      return true;
    },
    []
  );

  const { data, error, loading, flush } = useDataProvider(
    marketDepthDataProvider,
    update,
    variables
  );

  useEffect(() => {
    if (!data) {
      dataRef.current = null;
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = compact(data.depth.sell, data.depth.buy, resolution);
    setOrderbookData(dataRef.current);
  }, [data, resolution]);

  useEffect(() => {
    resolutionRef.current = resolution;
    flush();
  }, [resolution, flush]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && (
        <Orderbook data={orderbookData} decimalPlaces={data.decimalPlaces} />
      )}
    </AsyncRenderer>
  );
};
