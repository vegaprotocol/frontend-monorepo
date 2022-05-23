import throttle from 'lodash/throttle';
import produce from 'immer';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthDataProvider } from './market-depth-data-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MarketDepthSubscription_marketDepthUpdate } from './__generated__/MarketDepthSubscription';
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
  const setOrderbookDataThrottled = useRef(throttle(setOrderbookData, 1000));

  const update = useCallback(
    (delta: MarketDepthSubscription_marketDepthUpdate) => {
      if (!dataRef.current.rows) {
        return false;
      }
      dataRef.current = produce(dataRef.current, (draft) => {
        Object.assign(draft, delta.market.data);
        draft.rows = updateCompactedRows(
          draft.rows ?? [],
          delta.sell,
          delta.buy,
          resolutionRef.current
        );
        Object.assign(draft, mapMarketData(delta.market.data, resolution));
      });
      setOrderbookDataThrottled.current(dataRef.current);
      return true;
    },
    // using resolutionRef.current to avoid using resolution as a dependency - it will cause data proiver restart on resolution change
    []
  );

  const { data, error, loading, flush } = useDataProvider(
    marketDepthDataProvider,
    update,
    variables
  );

  useEffect(() => {
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
        resolution={resolution}
        onResolutionChange={(resolution: number) => setResolution(resolution)}
      />
    </AsyncRenderer>
  );
};
