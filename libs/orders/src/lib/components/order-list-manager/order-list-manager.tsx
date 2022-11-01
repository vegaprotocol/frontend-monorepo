import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';

import { OrderList } from '../order-list/order-list';
import { useOrderListData } from './use-order-list-data';

import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';

interface OrderListManagerProps {
  partyId: string;
}

export const OrderListManager = ({ partyId }: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);

  const { data, error, loading, addNewRows, getRows } = useOrderListData({
    partyId,
    gridRef,
    scrolledToTop,
  });

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={data || []}>
      <OrderList
        ref={gridRef}
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
