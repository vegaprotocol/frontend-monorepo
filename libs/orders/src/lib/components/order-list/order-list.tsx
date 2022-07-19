import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import {
  addDecimal,
  formatLabel,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import {
  AgGridDynamic as AgGrid,
  Button,
  Dialog,
} from '@vegaprotocol/ui-toolkit';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef, useState } from 'react';
import type { Orders_party_ordersConnection_edges_node } from '../';
import BigNumber from 'bignumber.js';
import type { OrderCancelInput } from '../../order-hooks/use-order-cancel';
import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import { VegaTransactionDialog } from '@vegaprotocol/wallet';
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderEditDialog } from './order-edit-dialog';

interface OrderListProps {
  data: Orders_party_ordersConnection_edges_node[] | null;
}

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  ({ data }, ref) => {
    // Cancel transaction dialog
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
    // Edit order transaction dialog
    const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
    // Order for edit order dialog
    const [editOrder, setEditOrder] =
      useState<Orders_party_ordersConnection_edges_node | null>(null);
    const { transaction, reset, cancel } = useOrderCancel();
    const {
      transaction: editTransaction,
      reset: resetEdit,
      edit,
    } = useOrderEdit();
    // const getEditDialogTitle = () =>
    //   editedOrder
    //     ? t(
    //         `Order ${
    //           editOrder?.market?.tradableInstrument.instrument.code ?? ''
    //         } updated`
    //       )
    //     : t(
    //         `Edit ${
    //           editOrder?.market?.tradableInstrument.instrument.code ?? ''
    //         } order`
    //       );
    return (
      <>
        <OrderListTable
          data={data}
          cancel={(order) => {
            setCancelOrderDialogOpen(true);
            cancel(order);
          }}
          ref={ref}
          setEditOrder={setEditOrder}
        />
        <VegaTransactionDialog
          isOpen={cancelOrderDialogOpen}
          onChange={(isOpen) => {
            setCancelOrderDialogOpen(isOpen);
            if (!isOpen) {
              reset();
            }
          }}
          transaction={transaction}
        />
        <VegaTransactionDialog
          isOpen={editOrderDialogOpen}
          onChange={(isOpen) => {
            setEditOrderDialogOpen(isOpen);
            if (!isOpen) {
              resetEdit();
            }
          }}
          transaction={editTransaction}
        />
        <EditOrderDialog
          editOrder={editOrder}
          setEditOrder={setEditOrder}
          onSubmit={(order) => {
            setEditOrder(null);
            setEditOrderDialogOpen(true);
            // @ts-ignore fix me, market is null
            edit(order);
          }}
        />
      </>
    );
  }
);

type OrderListTableValueFormatterParams = Omit<
  ValueFormatterParams,
  'data' | 'value'
> & {
  data: Orders_party_ordersConnection_edges_node | null;
};
interface OrderListTableProps {
  data: Orders_party_ordersConnection_edges_node[] | null;
  cancel: (order: OrderCancelInput) => void;
  setEditOrder: (
    order: Orders_party_ordersConnection_edges_node | null
  ) => void;
}

export const OrderListTable = forwardRef<AgGridReact, OrderListTableProps>(
  ({ data, cancel, setEditOrder }, ref) => {
    return (
      <AgGrid
        ref={ref}
        overlayNoRowsTemplate="No orders"
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data.id}
        rowHeight={40}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.code"
        />
        <AgGridColumn
          headerName={t('Amount')}
          field="size"
          cellClass="font-mono"
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['size'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            const prefix = data.side === Side.Buy ? '+' : '-';
            return (
              prefix + addDecimal(value, data.market.positionDecimalPlaces)
            );
          }}
        />
        <AgGridColumn field="type" />
        <AgGridColumn
          field="status"
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['status'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            if (value === OrderStatus.Rejected) {
              return `${value}: ${
                data.rejectionReason && formatLabel(data.rejectionReason)
              }`;
            }
            return value;
          }}
        />
        <AgGridColumn
          headerName={t('Filled')}
          field="remaining"
          cellClass="font-mono"
          valueFormatter={({
            data,
            value,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['remaining'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            const dps = data.market.positionDecimalPlaces;
            const size = new BigNumber(data.size);
            const remaining = new BigNumber(value);
            const fills = size.minus(remaining);
            return `${addDecimal(fills.toString(), dps)}/${addDecimal(
              size.toString(),
              dps
            )}`;
          }}
        />
        <AgGridColumn
          field="price"
          cellClass="font-mono"
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['price'];
          }) => {
            if (
              value === undefined ||
              !data ||
              !data.market ||
              data.type === 'Market'
            ) {
              return '-';
            }
            return addDecimal(value, data.market.decimalPlaces);
          }}
        />
        <AgGridColumn
          field="timeInForce"
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['timeInForce'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            if (value === OrderTimeInForce.GTT && data.expiresAt) {
              const expiry = getDateTimeFormat().format(
                new Date(data.expiresAt)
              );
              return `${value}: ${expiry}`;
            }

            return value;
          }}
        />
        <AgGridColumn
          field="createdAt"
          valueFormatter={({
            value,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['createdAt'];
          }) => {
            return value ? getDateTimeFormat().format(new Date(value)) : value;
          }}
        />
        <AgGridColumn
          field="updatedAt"
          valueFormatter={({
            value,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['updatedAt'];
          }) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '-';
          }}
        />
        <AgGridColumn
          field="edit"
          cellRenderer={({ data }: ICellRendererParams) => {
            if (
              ![
                OrderStatus.Cancelled,
                OrderStatus.Rejected,
                OrderStatus.Expired,
                OrderStatus.Filled,
                OrderStatus.Stopped,
              ].includes(data.status)
            ) {
              return (
                <Button
                  data-testid="edit"
                  variant="secondary"
                  onClick={() => {
                    setEditOrder(data);
                  }}
                >
                  Edit
                </Button>
              );
            }
            return null;
          }}
        />
        <AgGridColumn
          field="cancel"
          cellRenderer={({ data }: ICellRendererParams) => {
            if (
              ![
                OrderStatus.Cancelled,
                OrderStatus.Rejected,
                OrderStatus.Expired,
                OrderStatus.Filled,
                OrderStatus.Stopped,
              ].includes(data.status)
            ) {
              return (
                <Button
                  data-testid="cancel"
                  onClick={async () => {
                    await cancel({
                      orderId: data.id,
                      marketId: data.market.id,
                    });
                  }}
                >
                  Cancel
                </Button>
              );
            }
            return null;
          }}
        />
      </AgGrid>
    );
  }
);

interface EditOrderDialogProps {
  editOrder: Orders_party_ordersConnection_edges_node | null;
  setEditOrder: (
    order: Orders_party_ordersConnection_edges_node | null
  ) => void;
  onSubmit: (order: Orders_party_ordersConnection_edges_node) => void;
}

const EditOrderDialog = ({
  editOrder,
  setEditOrder,
  onSubmit,
}: EditOrderDialogProps) => {
  return (
    <Dialog open={Boolean(editOrder)} onChange={() => setEditOrder(null)}>
      {editOrder && <OrderEditDialog order={editOrder} onSubmit={onSubmit} />}
    </Dialog>
  );
};
