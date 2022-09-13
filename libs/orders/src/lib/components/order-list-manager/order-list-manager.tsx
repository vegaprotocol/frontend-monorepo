import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  useDataProvider,
  makeInfiniteScrollGetRows,
} from '@vegaprotocol/react-helpers';
import { useCallback, useMemo, useRef } from 'react';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';

import { marketsProvider } from '@vegaprotocol/market-list';
import { OrderList, ordersDataProvider as dataProvider } from '../';
import type { Orders_party_ordersConnection_edges, OrderSub_orders } from '../';

interface OrderListManagerProps {
  partyId: string;
}

export const OrderListManager = ({ partyId }: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<(Orders_party_ordersConnection_edges | null)[] | null>(
    null
  );
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);
  const scrolledToTop = useRef(true);
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
  }, []);

  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: (Orders_party_ordersConnection_edges | null)[];
      delta: OrderSub_orders[];
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
      data: Orders_party_ordersConnection_edges[];
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const {
    data: markets,
    error: marketsError,
    loading: marketsLoading,
  } = useDataProvider({
    dataProvider: marketsProvider,
  });

  const { data, error, loading, load, totalCount } = useDataProvider({
    dataProvider,
    update,
    insert,
    variables,
  });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows =
    makeInfiniteScrollGetRows<Orders_party_ordersConnection_edges>(
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
    <AsyncRenderer
      loading={loading || marketsLoading}
      error={error || marketsError}
      data={data && markets}
    >
      {markets && (
        <OrderList
          ref={gridRef}
          markets={markets}
          rowModelType="infinite"
          datasource={{ getRows }}
          onBodyScrollEnd={onBodyScrollEnd}
          onBodyScroll={onBodyScroll}
        />
      )}
    </AsyncRenderer>
  );
};
