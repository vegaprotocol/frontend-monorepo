import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import {
  makeInfiniteScrollGetRows,
  useDataProvider,
  updateGridData,
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
    () => ({
      partyId,
      dateRange: filter?.updatedAt?.value,
      marketId,
      filter: {
        status: filter?.status?.value,
        timeInForce: filter?.timeInForce?.value,
        types: filter?.type?.value,
      },
    }),
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
      totalCount,
    }: {
      data: (OrderEdge | null)[] | null;
      delta?: Order[];
      totalCount?: number;
    }) => {
      if (dataRef.current?.length && delta?.length && !scrolledToTop.current) {
        const createdAt = dataRef.current?.[0]?.node.createdAt;
        if (createdAt) {
          newRows.current += (delta || []).filter(
            (trade) => trade.createdAt > createdAt
          ).length;
        }
      }
      return updateGridData(dataRef, data, gridRef);
    },
    [gridRef, scrolledToTop]
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: (OrderEdge | null)[] | null;
      totalCount?: number;
    }) => {
      totalCountRef.current = totalCount;
      return updateGridData(dataRef, data, gridRef);
    },
    [gridRef]
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
