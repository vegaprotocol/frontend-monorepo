import throttle from 'lodash/throttle';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthDataProvider } from './market-depth-data-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MarketDepthSubscription_marketDepthUpdate } from './__generated__/MarketDepthSubscription';
import {
  compactData,
  updateCompactedData,
  getPriceLevel,
} from './orderbook-data';
import type { OrderbookData } from './orderbook-data';
import produce from 'immer';

interface OrderbookManagerProps {
  marketId: string;
}

export const OrderbookManager = ({ marketId }: OrderbookManagerProps) => {
  const [resolution, setResolution] = useState(1);
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const resolutionRef = useRef(resolution);
  const [orderbookData, setOrderbookData] = useState<{
    data: OrderbookData[] | null;
    midPrice?: string;
  }>({ data: null });
  const dataRef = useRef<{ data: OrderbookData[] | null; midPrice?: string }>({
    data: null,
  });
  const setOrderbookDataThrottled = useRef(throttle(setOrderbookData, 1000));

  const update = useCallback(
    (delta: MarketDepthSubscription_marketDepthUpdate) => {
      if (!dataRef.current.data) {
        return false;
      }
      dataRef.current = produce(dataRef.current, (draft) => {
        draft.data = updateCompactedData(
          draft.data ?? [],
          delta.sell,
          delta.buy,
          resolutionRef.current
        );
        draft.midPrice =
          delta.market.data?.midPrice &&
          getPriceLevel(delta.market.data?.midPrice, resolutionRef.current);
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
      dataRef.current = { data: null };
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = {
      data: compactData(data.depth.sell, data.depth.buy, resolution),
      midPrice:
        data.data?.midPrice && getPriceLevel(data.data?.midPrice, resolution),
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
