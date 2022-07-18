import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import { addDecimal, getDateTimeFormat, t } from '@vegaprotocol/react-helpers';
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

type OrderListProps = AgGridReactProps | AgReactUiProps;

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  (props, ref) => {
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
    const { transaction, updatedOrder, reset, cancel } = useOrderCancel();
    const getDialogTitle = (status?: string) => {
      switch (status) {
        case OrderStatus.Cancelled:
          return 'Order cancelled';
        case OrderStatus.Rejected:
          return 'Order rejected';
        case OrderStatus.Expired:
          return 'Order expired';
        default:
          return 'Cancellation failed';
      }
    };
    return (
      <>
        <OrderListTable {...props} cancel={cancel} ref={ref} />
        <VegaTransactionDialog
          key={`cancel-order-dialog-${transaction.txHash}`}
          orderDialogOpen={cancelOrderDialogOpen}
          setOrderDialogOpen={setCancelOrderDialogOpen}
          finalizedOrder={updatedOrder}
          transaction={transaction}
          reset={reset}
          title={getDialogTitle(updatedOrder?.status)}
        />
      </>
    );
  }
);

interface OrderListTableValueFormatterParams extends ValueFormatterParams {
  data: Orders_party_ordersConnection_edges_node | null;
}

type OrderListTableProps = (AgGridReactProps | AgReactUiProps) & {
  cancel: (body?: unknown) => Promise<unknown>;
};

export const OrderListTable = forwardRef<AgGridReact, OrderListTableProps>(
  ({ cancel, ...props }, ref) => {
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
          }: OrderListTableValueFormatterParams) => {
            if (!data || !data.market) {
              return null;
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
          }: OrderListTableValueFormatterParams) => {
            if (!data || !data.market) {
              return null;
            }
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
          valueFormatter={({ data }: OrderListTableValueFormatterParams) => {
            if (!data || !data.market) {
              return null;
            }
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
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams) => {
            if (!data || !data.market || data.type === 'Market') {
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
          }: OrderListTableValueFormatterParams) => {
            if (!data || !data.market) {
              return null;
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
          valueFormatter={({ value }: OrderListTableValueFormatterParams) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
        <AgGridColumn
          field="updatedAt"
          valueFormatter={({ value }: OrderListTableValueFormatterParams) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '-';
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
