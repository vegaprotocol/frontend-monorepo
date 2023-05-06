import { makeInfiniteScrollGetRows } from '@vegaprotocol/utils';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef } from 'react';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import type { Trade, TradeEdge } from './trades-data-provider';
import { useOrderStore } from '@vegaprotocol/orders';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<(TradeEdge | null)[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);
  const scrolledToTop = useRef(true);
  const updateOrder = useOrderStore((store) => store.update);

  const addNewRows = useCallback(() => {
    if (newRows.current === 0) {
      return;
    }
    if (totalCountRef.current !== undefined) {
      totalCountRef.current += newRows.current;
    }
    newRows.current = 0;
    gridRef.current?.api?.refreshInfiniteCache();
  }, []);

  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: (TradeEdge | null)[] | null;
      delta?: Trade[];
    }) => {
      if (dataRef.current?.length) {
        if (!scrolledToTop.current) {
          const createdAt = dataRef.current?.[0]?.node.createdAt;
          if (createdAt) {
            newRows.current += (delta || []).filter(
              (trade) => trade.createdAt > createdAt
            ).length;
          }
        }
        dataRef.current = data;
        gridRef.current?.api?.refreshInfiniteCache();
        return true;
      }
      dataRef.current = data;
      return false;
    },
    []
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: (TradeEdge | null)[] | null;
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const { data, error, loading, load, totalCount, reload } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    update,
    insert,
    variables: { marketId },
  });
  totalCountRef.current = totalCount;
  const getRows = makeInfiniteScrollGetRows<TradeEdge>(
    dataRef,
    totalCountRef,
    load,
    newRows
  );

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={data} reload={reload}>
      <TradesTable
        ref={gridRef}
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        onClick={(price?: string) => {
          if (price) {
            updateOrder(marketId, { price });
          }
        }}
      />
    </AsyncRenderer>
  );
};
