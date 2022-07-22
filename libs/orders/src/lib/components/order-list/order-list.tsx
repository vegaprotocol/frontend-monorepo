import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import {
  addDecimal,
  formatLabel,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, Button } from '@vegaprotocol/ui-toolkit';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type {
  AgGridReact,
  AgGridReactProps,
  AgReactUiProps,
} from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef, useState } from 'react';
import type { Orders_party_ordersConnection_edges_node } from '../';
import BigNumber from 'bignumber.js';

import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import { VegaTransactionDialog } from '@vegaprotocol/wallet';
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderEditDialog } from './order-edit-dialog';
import type { OrderFields } from '../order-data-provider/__generated__';

type OrderListProps = AgGridReactProps | AgReactUiProps;

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  (props, ref) => {
    const [cancelTxOpen, setCancelTxOpen] = useState(false);
    const [editTxOpen, setEditTxOpen] = useState(false);
    const [editOrder, setEditOrder] = useState<OrderFields | null>(null);

    const { transaction, cancelledOrder, reset, cancel } = useOrderCancel();

    const {
      transaction: editTransaction,
      updatedOrder,
      reset: resetEdit,
      edit,
    } = useOrderEdit(editOrder);

    return (
      <>
        <OrderListTable
          {...props}
          cancel={(order) => {
            if (!order.market?.id) return;
            setCancelTxOpen(true);
            cancel({
              orderId: order.id,
              marketId: order.market.id,
            });
          }}
          ref={ref}
          setEditOrder={setEditOrder}
        />
        <VegaTransactionDialog
          key={`cancel-order-dialog-${transaction.txHash}`}
          isOpen={cancelTxOpen}
          onChange={(isOpen) => {
            if (!isOpen) reset();
            setCancelTxOpen(isOpen);
          }}
          transaction={transaction}
        />
        <VegaTransactionDialog
          key={`edit-order-dialog-${transaction.txHash}`}
          isOpen={editTxOpen}
          onChange={(isOpen) => {
            if (!isOpen) resetEdit();
            setEditTxOpen(isOpen);
          }}
          transaction={editTransaction}
        />
        <OrderEditDialog
          isOpen={Boolean(editOrder)}
          onChange={(isOpen) => {
            if (!isOpen) setEditOrder(null);
          }}
          order={editOrder}
          onSubmit={(fields) => {
            setEditOrder(null);
            setEditTxOpen(true);
            edit({ price: fields.entryPrice });
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

type OrderListTableProps = (AgGridReactProps | AgReactUiProps) & {
  cancel: (order: OrderFields) => void;
  setEditOrder: (order: OrderFields) => void;
};

export const OrderListTable = forwardRef<AgGridReact, OrderListTableProps>(
  ({ cancel, setEditOrder, ...props }, ref) => {
    return (
      <AgGrid
        ref={ref}
        overlayNoRowsTemplate="No orders"
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data.id}
        rowHeight={40}
        {...props}
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
            if (isOrderActive(data.status)) {
              return (
                <Button
                  data-testid="edit"
                  variant="secondary"
                  onClick={() => {
                    setEditOrder(data);
                  }}
                >
                  {t('Edit')}
                </Button>
              );
            }

            return null;
          }}
        />
        <AgGridColumn
          field="cancel"
          cellRenderer={({ data }: ICellRendererParams) => {
            if (isOrderActive(data.status)) {
              return (
                <Button data-testid="cancel" onClick={() => cancel(data)}>
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

// const getCancelDialogTitle = (status?: string) => {
//       switch (status) {
//         case OrderStatus.Cancelled:
//           return 'Order cancelled';
//         case OrderStatus.Rejected:
//           return 'Order rejected';
//         case OrderStatus.Expired:
//           return 'Order expired';
//         default:
//           return 'Cancellation failed';
//       }
//     };

/**
 * Check if an order is active to determine if it can be edited or cancelled
 */
const isOrderActive = (status: OrderStatus) => {
  return ![
    OrderStatus.Cancelled,
    OrderStatus.Rejected,
    OrderStatus.Expired,
    OrderStatus.Filled,
    OrderStatus.Stopped,
  ].includes(status);
};
