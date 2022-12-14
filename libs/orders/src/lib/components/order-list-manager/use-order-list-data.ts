import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import {
  makeInfiniteScrollGetRows,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { ordersWithMarketProvider } from '../order-data-provider/order-data-provider';
import type {
  OrderEdge,
  Order,
} from '../order-data-provider/order-data-provider';
import type {
  OrdersQueryVariables,
  OrdersUpdateSubscriptionVariables,
} from '../order-data-provider/__generated__/Orders';
import type * as Types from '@vegaprotocol/types';
export interface Sort {
  colId: string;
  sort: string;
}
export interface Filter {
  updatedAt?: {
    value: Types.DateRange;
  };
  type?: {
    value: Types.OrderType[];
  };
  status?: {
    value: Types.OrderStatus[];
  };
  timeInForce?: {
    value: Types.OrderTimeInForce[];
  };
}
interface Props {
  partyId: string;
  marketId?: string;
  filter?: Filter;
  sort?: Sort[];
  gridRef: RefObject<AgGridReact>;
  scrolledToTop: RefObject<boolean>;
}

export const useOrderListData = ({
  partyId,
  marketId,
  sort,
  filter,
  gridRef,
  scrolledToTop,
}: Props) => {
  const dataRef = useRef<(OrderEdge | null)[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);

  const variables = useMemo<
    OrdersQueryVariables & OrdersUpdateSubscriptionVariables
  >(
    () => ({ partyId, dateRange: filter?.updatedAt?.value, marketId }),
    [partyId, marketId, filter]
  );

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
      data: (OrderEdge | null)[] | null;
      delta?: Order[];
    }) => {
      if (dataRef.current?.length && delta?.length && !scrolledToTop.current) {
        const createdAt = dataRef.current?.[0]?.node.createdAt;
        if (createdAt) {
          newRows.current += (delta || []).filter(
            (trade) => trade.createdAt > createdAt
          ).length;
        }
      }
      const avoidRerender = !!(
        (dataRef.current?.length && data?.length) ||
        (!dataRef.current?.length && !data?.length)
      );
      dataRef.current =
        !!marketId && !!data
          ? data.filter((d) => d?.node.market?.id === marketId)
          : data;
      gridRef.current?.api?.refreshInfiniteCache();
      return avoidRerender;
    },
    [gridRef, scrolledToTop, marketId]
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: (OrderEdge | null)[] | null;
      totalCount?: number;
    }) => {
      dataRef.current =
        !!marketId && !!data
          ? data.filter((d) => d?.node.market?.id === marketId)
          : data;
      totalCountRef.current = totalCount;
      return true;
    },
    [marketId]
  );

  const { data, error, loading, load, totalCount } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    update,
    insert,
    variables,
  });
  totalCountRef.current = totalCount;

  const getRows = makeInfiniteScrollGetRows<OrderEdge>(
    dataRef,
    totalCountRef,
    load,
    newRows
  );
  return { loading, error, data, addNewRows, getRows };
};
