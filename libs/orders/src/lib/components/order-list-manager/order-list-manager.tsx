import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { useCallback, useMemo, useRef } from 'react';
import type {
  IGetRowsParams,
  BodyScrollEvent,
  BodyScrollEndEvent,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';

import { OrderList, ordersDataProvider as dataProvider } from '../';
import type { OrderFields, Orders_party_ordersConnection_edges } from '../';

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
      delta: OrderFields[];
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
    console.log('getRows');
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
      } else if (rowsThisBlock.length < endRow - startRow) {
        lastRow = rowsThisBlock.length;
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
      <OrderList
        ref={gridRef}
        rowModelType="infinite"
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
