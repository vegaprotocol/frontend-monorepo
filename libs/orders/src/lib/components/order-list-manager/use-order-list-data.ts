import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import {
  makeInfiniteScrollGetRows,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { ordersWithMarketProvider } from '../';
import type { OrderWithMarketEdge, OrderWithMarket } from '../';

interface Props {
  partyId: string;
  gridRef: RefObject<AgGridReact>;
  scrolledToTop: RefObject<boolean>;
}

export const useOrderListData = ({
  partyId,
  gridRef,
  scrolledToTop,
}: Props) => {
  const dataRef = useRef<(OrderWithMarketEdge | null)[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);

  const variables = useMemo(() => ({ partyId }), [partyId]);

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
      data: (OrderWithMarketEdge | null)[];
      delta: OrderWithMarket[];
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
    [gridRef, scrolledToTop]
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: (OrderWithMarketEdge | null)[];
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const { data, error, loading, load, totalCount } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    update,
    insert,
    variables,
  });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = makeInfiniteScrollGetRows<OrderWithMarketEdge>(
    newRows,
    dataRef,
    totalCountRef,
    load
  );
  return { loading, error, data, addNewRows, getRows };
};
