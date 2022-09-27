import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import {
  makeInfiniteScrollGetRows,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import type {
  TradeWithMarket,
  TradeWithMarketEdge,
} from './fills-data-provider';
import { fillsWithMarketProvider } from './fills-data-provider';

interface Props {
  partyId: string;
  gridRef: RefObject<AgGridReact>;
  scrolledToTop: RefObject<boolean>;
}

export const useFillsList = ({ partyId, gridRef, scrolledToTop }: Props) => {
  const dataRef = useRef<(TradeWithMarketEdge | null)[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);

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
  }, [gridRef]);

  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: (TradeWithMarketEdge | null)[] | null;
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
    [gridRef, scrolledToTop]
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: (TradeWithMarketEdge | null)[] | null;
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const variables = useMemo(() => ({ partyId }), [partyId]);

  const { data, error, loading, load, totalCount } = useDataProvider<
    (TradeWithMarketEdge | null)[],
    TradeWithMarket[]
  >({ dataProvider: fillsWithMarketProvider, update, insert, variables });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = makeInfiniteScrollGetRows<TradeWithMarketEdge>(
    newRows,
    dataRef,
    totalCountRef,
    load
  );
  return { data, error, loading, addNewRows, getRows };
};
