import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import type { Orders_party_orders } from '../__generated__/Orders';
import { addDecimal, getDateTimeFormat, t } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, Button } from '@vegaprotocol/ui-toolkit';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import {
  VegaOrderTransactionType,
  VegaTransactionDialog,
} from '@vegaprotocol/wallet';
import { useOrderEdit } from '../../order-hooks/use-order-edit';

interface OrderListProps {
  data: Orders_party_orders[] | null;
}

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  ({ data }, ref) => {
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
    const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
    const { transaction, finalizedOrder, reset, cancel } = useOrderCancel();
    const { editTransaction, updatedOrder, resetEdit, edit } = useOrderEdit();
    return (
      <>
        <OrderListTable data={data} cancel={cancel} edit={edit} ref={ref} />
        <VegaTransactionDialog
          key={`cancel-order-dialog-${transaction.txHash}`}
          orderDialogOpen={cancelOrderDialogOpen}
          setOrderDialogOpen={setCancelOrderDialogOpen}
          finalizedOrder={finalizedOrder}
          transaction={transaction}
          reset={reset}
          type={VegaOrderTransactionType.CANCEL}
        />
        <VegaTransactionDialog
          key={`edit-order-dialog-${transaction.txHash}`}
          orderDialogOpen={editOrderDialogOpen}
          setOrderDialogOpen={setEditOrderDialogOpen}
          finalizedOrder={updatedOrder}
          transaction={editTransaction}
          reset={resetEdit}
          type={VegaOrderTransactionType.EDIT}
        />
      </>
    );
  }
);

interface OrderListTableProps {
  data: Orders_party_orders[] | null;
  cancel: (body?: unknown) => Promise<unknown>;
  edit: (body?: unknown) => Promise<unknown>;
}

export const OrderListTable = forwardRef<AgGridReact, OrderListTableProps>(
  ({ data, cancel, edit }, ref) => {
    return (
      <AgGrid
        ref={ref}
        rowData={data}
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
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            const prefix = data.side === Side.Buy ? '+' : '-';
            return (
              prefix + addDecimal(value, data.market.positionDecimalPlaces)
            );
          }}
        />
        <AgGridColumn field="type" />
        <AgGridColumn
          field="status"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            if (value === OrderStatus.Rejected) {
              return `${value}: ${data.rejectionReason}`;
            }

            return value;
          }}
        />
        <AgGridColumn
          headerName={t('Filled')}
          field="remaining"
          cellClass="font-mono"
          valueFormatter={({ data }: ValueFormatterParams) => {
            const dps = data.market.positionDecimalPlaces;
            const size = new BigNumber(data.size);
            const remaining = new BigNumber(data.remaining);
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
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            if (data.type === 'Market') {
              return '-';
            }
            return addDecimal(value, data.market.decimalPlaces);
          }}
        />
        <AgGridColumn
          field="timeInForce"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
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
          valueFormatter={({ value }: ValueFormatterParams) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
        <AgGridColumn
          field="updatedAt"
          valueFormatter={({ value }: ValueFormatterParams) => {
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
                  onClick={async () => {
                    await edit(data);
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
                    await cancel(data);
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
