import {
  OrderTimeInForce,
  OrderStatus,
  Side,
  OrderType,
} from '@vegaprotocol/types';
import {
  addDecimal,
  formatLabel,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import {
  AgGridDynamic as AgGrid,
  Button,
  Intent,
} from '@vegaprotocol/ui-toolkit';
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
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderEditDialog } from './order-edit-dialog';
import type { OrderFields } from '../order-data-provider/__generated__';
import { OrderFeedback } from '../order-feedback';

type OrderListProps = AgGridReactProps | AgReactUiProps;

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  (props, ref) => {
    const [editOrder, setEditOrder] = useState<OrderFields | null>(null);
    const orderCancel = useOrderCancel();
    const orderEdit = useOrderEdit(editOrder);

    return (
      <>
        <OrderListTable
          {...props}
          cancel={(order) => {
            if (!order.market) return;
            orderCancel.cancel({
              orderId: order.id,
              marketId: order.market.id,
            });
          }}
          ref={ref}
          setEditOrder={setEditOrder}
        />
        <orderCancel.TransactionDialog
          title={getCancelDialogTitle(orderCancel.cancelledOrder?.status)}
          intent={getCancelDialogIntent(orderCancel.cancelledOrder?.status)}
        >
          <OrderFeedback
            transaction={orderCancel.transaction}
            order={orderCancel.cancelledOrder}
          />
        </orderCancel.TransactionDialog>
        <orderEdit.TransactionDialog
          title={getEditDialogTitle(orderEdit.updatedOrder?.status)}
        >
          <OrderFeedback
            transaction={orderEdit.transaction}
            order={orderEdit.updatedOrder}
          />
        </orderEdit.TransactionDialog>
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
          headerName={t('Size')}
          field="size"
          cellClass="font-mono"
          cellClassRules={{
            'text-vega-green-dark dark:text-vega-green': ({
              data,
            }: {
              data: Orders_party_ordersConnection_edges_node;
            }) => data.side === Side.SIDE_BUY,
            'text-vega-red-dark dark:text-vega-red': ({
              data,
            }: {
              data: Orders_party_ordersConnection_edges_node;
            }) => data.side === Side.SIDE_SELL,
          }}
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: Orders_party_ordersConnection_edges_node['size'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            const prefix = data.side === Side.SIDE_BUY ? '+' : '-';
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
            if (value === OrderStatus.STATUS_REJECTED) {
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
              data.type === OrderType.TYPE_MARKET
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
            if (
              value === OrderTimeInForce.TIME_IN_FORCE_GTT &&
              data.expiresAt
            ) {
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
            if (!data) return null;
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
            if (!data) return null;
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

/**
 * Check if an order is active to determine if it can be edited or cancelled
 */
const isOrderActive = (status: OrderStatus) => {
  return ![
    OrderStatus.STATUS_CANCELLED,
    OrderStatus.STATUS_REJECTED,
    OrderStatus.STATUS_EXPIRED,
    OrderStatus.STATUS_FILLED,
    OrderStatus.STATUS_STOPPED,
  ].includes(status);
};

const getEditDialogTitle = (status?: OrderStatus): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.STATUS_ACTIVE:
      return t('Order updated');
    case OrderStatus.STATUS_FILLED:
      return t('Order filled');
    case OrderStatus.STATUS_PARTIALLY_FILLED:
      return t('Order partially filled');
    case OrderStatus.STATUS_PARKED:
      return t('Order parked');
    default:
      return t('Submission failed');
  }
};

const getCancelDialogIntent = (status?: OrderStatus): Intent | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.STATUS_CANCELLED:
      return Intent.Success;
    default:
      return Intent.Danger;
  }
};

const getCancelDialogTitle = (status?: OrderStatus): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    default:
      return t('Order cancellation failed');
  }
};
