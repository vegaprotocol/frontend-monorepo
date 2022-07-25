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

type OrderListProps = AgGridReactProps | AgReactUiProps;

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  (props, ref) => {
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
    const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
    const [editOrder, setEditOrder] =
      useState<Orders_party_ordersConnection_edges_node | null>(null);

    const { transaction, updatedOrder, reset, cancel } = useOrderCancel();
    const {
      transaction: editTransaction,
      updatedOrder: editedOrder,
      reset: resetEdit,
      edit,
    } = useOrderEdit();
    const getCancelDialogTitle = (status?: string) => {
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
    const getEditDialogTitle = () =>
      editedOrder
        ? t(
            `Order ${
              editOrder?.market?.tradableInstrument.instrument.code ?? ''
            } updated`
          )
        : t(
            `Edit ${
              editOrder?.market?.tradableInstrument.instrument.code ?? ''
            } order`
          );
    return (
      <>
        <OrderListTable
          {...props}
          cancel={cancel}
          ref={ref}
          setEditOrderDialogOpen={setEditOrderDialogOpen}
          setEditOrder={setEditOrder}
        />
        <VegaTransactionDialog
          key={`cancel-order-dialog-${transaction.txHash}`}
          orderDialogOpen={cancelOrderDialogOpen}
          setOrderDialogOpen={setCancelOrderDialogOpen}
          transaction={transaction}
          reset={reset}
          title={getCancelDialogTitle(updatedOrder?.status)}
          finalizedOrder={updatedOrder}
        />
        <VegaTransactionDialog
          key={`edit-order-dialog-${transaction.txHash}`}
          orderDialogOpen={editOrderDialogOpen}
          setOrderDialogOpen={setEditOrderDialogOpen}
          transaction={editTransaction}
          reset={resetEdit}
          title={getEditDialogTitle()}
          finalizedOrder={editedOrder}
        >
          <OrderEditDialog
            title={getEditDialogTitle()}
            order={editOrder}
            edit={edit}
          />
        </VegaTransactionDialog>
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
  cancel: (body?: unknown) => Promise<unknown>;
  setEditOrderDialogOpen: (value: boolean) => void;
  setEditOrder: (
    order: Orders_party_ordersConnection_edges_node | null
  ) => void;
};

export const OrderListTable = forwardRef<AgGridReact, OrderListTableProps>(
  ({ cancel, setEditOrderDialogOpen, setEditOrder, ...props }, ref) => {
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
                    setEditOrderDialogOpen(true);
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
