import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { BodyScrollEndEvent, BodyScrollEvent } from 'ag-grid-community';
import type { OrderFields } from '@vegaprotocol/orders';
import { useOrderListData } from '@vegaprotocol/orders';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import useColumnDefinitions from './use-column-definitions';

interface Props {
  partyId: string;
}

const OrdersManager = ({ partyId }: Props) => {
  const { columnDefs, defaultColDef } = useColumnDefinitions();
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
    <AsyncRenderer loading={loading} error={error} data={data}>
      <ConsoleLiteGrid<OrderFields>
        ref={gridRef}
        rowModelType="infinite"
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      />
    </AsyncRenderer>
  );
};

export default OrdersManager;
