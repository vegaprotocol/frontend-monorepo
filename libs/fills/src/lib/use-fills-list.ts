import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import {
  makeInfiniteScrollGetRows,
  useDataProvider,
  updateGridData,
} from '@vegaprotocol/utils';
import type { Trade, TradeEdge } from './fills-data-provider';
import { fillsWithMarketProvider } from './fills-data-provider';

interface Props {
  partyId: string;
  marketId?: string;
  gridRef: RefObject<AgGridReact>;
  scrolledToTop: RefObject<boolean>;
}

export const useFillsList = ({
  partyId,
  marketId,
  gridRef,
  scrolledToTop,
}: Props) => {
  const dataRef = useRef<(TradeEdge | null)[] | null>(null);
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
    gridRef.current?.api?.refreshInfiniteCache();
  }, [gridRef]);

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
        return updateGridData(dataRef, data, gridRef);
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
      data: (TradeEdge | null)[] | null;
      totalCount?: number;
    }) => {
      totalCountRef.current = totalCount;
      return updateGridData(dataRef, data, gridRef);
    },
    [gridRef]
  );

  const variables = useMemo(() => ({ partyId, marketId }), [partyId, marketId]);

  const { data, error, loading, load, totalCount, reload } = useDataProvider<
    (TradeEdge | null)[],
    Trade[]
  >({
    dataProvider: fillsWithMarketProvider,
    update,
    insert,
    variables,
  });
  totalCountRef.current = totalCount;

  const getRows = makeInfiniteScrollGetRows<TradeEdge>(
    dataRef,
    totalCountRef,
    load,
    newRows
  );
  return { data, error, loading, addNewRows, getRows, reload };
};
