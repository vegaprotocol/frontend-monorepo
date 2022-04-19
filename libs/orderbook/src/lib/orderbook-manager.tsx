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
  const lastUpdateRef = useRef(new Date().getTime());
  const [orderbookData, setOrderbookData] = useState<OrderbookData[] | null>(
    null
  );
  const dataRef = useRef<OrderbookData[] | null>(null);

  // Apply updates to the table
  const update = useCallback(
    (delta: MarketDepthSubscription_marketDepthUpdate) => {
      if (!gridRef.current || !dataRef.current) {
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
        const update: OrderbookData[] = [];
        const remove: OrderbookData[] = [];
        gridRef.current.api.forEachNode(({ data }: { data: OrderbookData}) => {
          if (!dataRef.current?.some((d) => d.price === data.price )) {
            remove.push(data);
          }
        })
        if (remove.length > 0) {
          gridRef.current.api.applyTransactionAsync({
            remove
          })
        }
        dataRef.current.forEach((data, i) => {
          if (gridRef.current?.api.getRowNode(data.price.toString())) {
            update.push(data)
          } else {
            gridRef.current?.api.applyTransactionAsync({
              add: [data],
              addIndex: i
            });
          }
        })
        
        gridRef.current?.api.applyTransactionAsync({
          update
        })
        //setOrderbookData(dataRef.current);
        lastUpdateRef.current = now;
      }
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
      dataRef.current = null;
      setOrderbookData(dataRef.current);
      return;
    }
    dataRef.current = compact(data.depth.sell, data.depth.buy, resolution);
    setOrderbookData(dataRef.current);
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
