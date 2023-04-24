import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { makeInfiniteScrollGetRows } from '@vegaprotocol/utils';
import { useDataProvider, updateGridData } from '@vegaprotocol/react-helpers';
import { OrderStatus } from '@vegaprotocol/types';
import { ordersWithMarketProvider } from '../order-data-provider/order-data-provider';
import type {
  OrderEdge,
  Order,
} from '../order-data-provider/order-data-provider';
import type {
  OrdersQueryVariables,
  OrdersUpdateSubscriptionVariables,
} from '../order-data-provider/__generated__/Orders';

export enum Filter {
  'Open' = 1,
  'Closed',
  'Rejected',
}

const FilterStatus = {
  [Filter.Open]: [OrderStatus.STATUS_ACTIVE, OrderStatus.STATUS_PARKED],
  [Filter.Closed]: [
    OrderStatus.STATUS_CANCELLED,
    OrderStatus.STATUS_EXPIRED,
    OrderStatus.STATUS_FILLED,
    OrderStatus.STATUS_PARTIALLY_FILLED,
    OrderStatus.STATUS_STOPPED,
  ],
  [Filter.Rejected]: [OrderStatus.STATUS_REJECTED],
};
interface Props {
  partyId: string;
  filter?: Filter;
  gridRef: RefObject<AgGridReact>;
  scrolledToTop: RefObject<boolean>;
}

export const useOrderListData = ({
  partyId,
  filter,
  gridRef,
  scrolledToTop,
}: Props) => {
  const dataRef = useRef<(OrderEdge | null)[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);
  const placeholderAdded = useRef(-1);

  const makeBottomPlaceholders = useCallback((order?: Order) => {
    if (!order) {
      if (placeholderAdded.current >= 0) {
        dataRef.current?.splice(placeholderAdded.current, 1);
      }
      placeholderAdded.current = -1;
    } else if (placeholderAdded.current === -1) {
      dataRef.current?.push({
        node: { ...order, id: `${order?.id}-1`, isLastPlaceholder: true },
      });
      placeholderAdded.current = (dataRef.current?.length || 0) - 1;
    }
  }, []);

  const variables = useMemo(() => {
    // define variable as const to get type safety, using generic with useMemo resulted in lost type safety
    const allVars: OrdersQueryVariables & OrdersUpdateSubscriptionVariables = {
      partyId,
    };
    if (filter === Filter.Open) {
      allVars.filter = {
        liveOnly: true,
      };
    }
    return allVars;
  }, [partyId, filter]);

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
      if (gridRef.current?.api?.getModel().getType() === 'infinite') {
        return updateGridData(dataRef, data, gridRef);
      }
      return false;
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
      if (gridRef.current?.api?.getModel().getType() === 'infinite') {
        return updateGridData(dataRef, data, gridRef);
      }
      return false;
    },
    [gridRef]
  );

  const { data, error, loading, load, totalCount, reload } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    update,
    insert,
    variables,
  });
  totalCountRef.current = totalCount;

  const getRows = useRef(
    makeInfiniteScrollGetRows<OrderEdge>(dataRef, totalCountRef, load, newRows)
  );
  return {
    loading,
    error,
    data,
    addNewRows,
    getRows: getRows.current,
    reload,
    makeBottomPlaceholders,
  };
};
