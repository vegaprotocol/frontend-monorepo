import { useRef, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { BodyScrollEndEvent, BodyScrollEvent } from 'ag-grid-community';
import { useOutletContext } from 'react-router-dom';
import type { Order } from '@vegaprotocol/orders';
import {
  useOrderCancel,
  useOrderListData,
  useOrderEdit,
  OrderFeedback,
  getCancelDialogTitle,
  getCancelDialogIntent,
  getEditDialogTitle,
  OrderEditDialog,
} from '@vegaprotocol/orders';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import { NO_DATA_MESSAGE } from '../../../constants';
import useColumnDefinitions from './use-column-definitions';

const OrdersManager = () => {
  const { partyId } = useOutletContext<{ partyId: string }>();
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const orderCancel = useOrderCancel();
  const orderEdit = useOrderEdit(editOrder);
  const { columnDefs, defaultColDef } = useColumnDefinitions({
    setEditOrder,
    orderCancel,
  });

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
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data?.length ? data : null}
      noDataMessage={NO_DATA_MESSAGE}
    >
      <ConsoleLiteGrid<Order>
        ref={gridRef}
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      />
      <orderCancel.Dialog
        title={getCancelDialogTitle(orderCancel.cancelledOrder?.status)}
        intent={getCancelDialogIntent(orderCancel.cancelledOrder?.status)}
      >
        <OrderFeedback
          transaction={orderCancel.transaction}
          order={orderCancel.cancelledOrder}
        />
      </orderCancel.Dialog>
      <orderEdit.Dialog
        title={getEditDialogTitle(orderEdit.updatedOrder?.status)}
      >
        <OrderFeedback
          transaction={orderEdit.transaction}
          order={orderEdit.updatedOrder}
        />
      </orderEdit.Dialog>
      {editOrder && (
        <OrderEditDialog
          isOpen={Boolean(editOrder)}
          onChange={(isOpen) => {
            if (!isOpen) setEditOrder(null);
          }}
          order={editOrder}
          onSubmit={(fields) => {
            setEditOrder(null);
            orderEdit.edit({ price: fields.entryPrice });
          }}
        />
      )}
    </AsyncRenderer>
  );
};

export default OrdersManager;
