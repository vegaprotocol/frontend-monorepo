import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import {
  makeInfiniteScrollGetRows,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { ordersWithMarketProvider } from '../';
import type { OrderEdge, Order } from '../';

export interface Sort {
  colId: string;
  sort: string;
}
export interface Filter {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
interface Props {
  partyId: string;
  filter?: Filter;
  sort?: Sort[];
  gridRef: RefObject<AgGridReact>;
  scrolledToTop: RefObject<boolean>;
}

export const useOrderListData = ({
  partyId,
  sort,
  filter,
  gridRef,
  scrolledToTop,
}: Props) => {
  const dataRef = useRef<(OrderEdge | null)[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);

  const variables = useMemo(
    () => ({ partyId, sort, filter }),
    [partyId, sort, filter]
  );

  const addNewRows = useCallback(() => {
    if (newRows.current === 0) {
      return;
    }
    if (totalCountRef.current !== undefined) {
      totalCountRef.current += newRows.current;
    }
    newRows.current = 0;
    gridRef.current?.api.refreshInfiniteCache();
  }, [gridRef]);

  const update = useCallback(
    ({ data, delta }: { data: (OrderEdge | null)[]; delta?: Order[] }) => {
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
        gridRef.current?.api.refreshInfiniteCache();
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
      data: (OrderEdge | null)[];
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
  if (!dataRef.current && data) {
    totalCountRef.current = totalCount;
    dataRef.current = data;
  }

  const getRows = makeInfiniteScrollGetRows<OrderEdge>(
    newRows,
    dataRef,
    totalCountRef,
    load
  );
  return { loading, error, data, addNewRows, getRows };
};
