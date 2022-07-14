import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import type {
  IGetRowsParams,
  BodyScrollEvent,
  BodyScrollEndEvent,
} from 'ag-grid-community';
import {
  MAX_TRADES,
  tradesDataProvider as dataProvider,
} from './trades-data-provider';
import { TradesTable } from './trades-table';
import type { TradeFields } from './__generated__/TradeFields';
import type {
  TradesVariables,
  Trades_market_tradesConnection_edges,
} from './__generated__/Trades';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<
    (Trades_market_tradesConnection_edges | null)[] | null
  >(null);
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
      data: (Trades_market_tradesConnection_edges | null)[];
      delta: TradeFields[];
    }) => {
      if (!gridRef.current?.api) {
        return false;
      }
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
    },
    []
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: (Trades_market_tradesConnection_edges | null)[];
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const { data, error, loading, load, totalCount } = useDataProvider({
    dataProvider,
    update,
    insert,
    variables,
  });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = async ({
    successCallback,
    failCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    startRow += newRows.current;
    endRow += newRows.current;
    try {
      if (dataRef.current && dataRef.current.indexOf(null) < endRow) {
        await load();
      }
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow).map((edge) => edge?.node)
        : [];
      let lastRow = -1;
      if (totalCountRef.current !== undefined) {
        if (!totalCountRef.current) {
          lastRow = 0;
        } else if (totalCountRef.current <= endRow) {
          lastRow = totalCountRef.current;
        }
      }
      successCallback(rowsThisBlock, lastRow);
    } catch (e) {
      failCallback();
    }
  };

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
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
