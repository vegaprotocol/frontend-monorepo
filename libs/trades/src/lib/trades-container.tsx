import {
  useDataProvider,
  makeInfiniteScrollGetRows,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import { MAX_TRADES, tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import type {
  TradeWithMarket,
  TradeWithMarketEdge,
} from './trades-data-provider';
import type { TradesVariables } from './__generated__/Trades';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<(TradeWithMarketEdge | null)[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);
  const scrolledToTop = useRef(true);

  const variables = useMemo<TradesVariables>(
    () => ({ marketId, maxTrades: MAX_TRADES }),
    [marketId]
  );

  const addNewRows = useCallback(() => {
    if (newRows.current === 0) {
      return;
    }
    if (totalCountRef.current !== undefined) {
      totalCountRef.current += newRows.current;
    }
    newRows.current = 0;
    if (!gridRef.current?.api) {
      return;
    }
    gridRef.current.api.refreshInfiniteCache();
  }, []);

  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: (TradeWithMarketEdge | null)[];
      delta: TradeWithMarket[];
    }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      if (dataRef.current?.length) {
        if (!scrolledToTop.current) {
          const createdAt = dataRef.current?.[0]?.node.createdAt;
          if (createdAt) {
            newRows.current += delta.filter(
              (trade) => trade.createdAt > createdAt
            ).length;
          }
        }
        dataRef.current = data;
        gridRef.current.api.refreshInfiniteCache();
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
      data: (TradeWithMarketEdge | null)[];
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const { data, error, loading, load, totalCount } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    update,
    insert,
    variables,
  });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = makeInfiniteScrollGetRows<TradeWithMarketEdge>(
    newRows,
    dataRef,
    totalCountRef,
    load
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
    <AsyncRenderer loading={loading} error={error} data={data}>
      <TradesTable
        ref={gridRef}
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
