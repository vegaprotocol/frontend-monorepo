import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { marketDepthDataProvider } from './market-depth-data-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
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
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const resolutionRef = useRef(resolution);
  const [orderbookData, setOrderbookData] = useState<OrderbookData[] | null>(
    null
  );

  // Apply updates to the table
  const update = useCallback(
    (
      delta: MarketDepthSubscription_marketDepthUpdate,
      updatedDataRef?: { current: OrderbookData[] | null }
    ) => {
      if (!gridRef.current || !updatedDataRef || !updatedDataRef.current) {
        return false;
      }
      updatedDataRef.current = updateCompactedData(
        updatedDataRef.current,
        delta.sell,
        delta.buy,
        resolutionRef.current
      );
      setOrderbookData(updatedDataRef.current);
      return true;
    },
    []
  );

  const { data, error, loading } = useDataProvider(
    marketDepthDataProvider,
    update,
    variables
  );

  useEffect(() => {
    if (!data) {
      return setOrderbookData(null);
    }
    setOrderbookData(compact(data.depth.sell, data.depth.buy, resolution));
  }, [data, resolution]);

  useEffect(() => {
    resolutionRef.current = resolution;
  }, [resolution]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && (
        <Orderbook
          ref={gridRef}
          data={orderbookData}
          decimalPlaces={data.decimalPlaces}
        />
      )}
    </AsyncRenderer>
  );
};
