import {
  Schema,
  OrderTypeMapping,
  OrderStatusMapping,
  OrderTimeInForceMapping,
  OrderRejectionReasonMapping,
} from '@vegaprotocol/types';
import {
  addDecimal,
  getDateTimeFormat,
  t,
  positiveClassNames,
  negativeClassNames,
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
import type { OrderFieldsFragment } from '../../order-hooks/__generated__/Orders';
import BigNumber from 'bignumber.js';

import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderEditDialog } from './order-edit-dialog';
import { OrderFeedback } from '../order-feedback';

type OrderListProps = AgGridReactProps | AgReactUiProps;

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  (props, ref) => {
    const [editOrder, setEditOrder] = useState<OrderFieldsFragment | null>(null);
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
      </>
    );
  }
);

type OrderListTableValueFormatterParams = Omit<
  ValueFormatterParams,
  'data' | 'value'
> & {
  data: OrderFieldsFragment | null;
};

type OrderListTableProps = (AgGridReactProps | AgReactUiProps) & {
  cancel: (order: OrderFieldsFragment) => void;
  setEditOrder: (order: OrderFieldsFragment) => void;
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
        rowHeight={34}
        {...props}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.code"
        />
        <AgGridColumn
          headerName={t('Size')}
          field="size"
          cellClass="font-mono text-right"
          type="rightAligned"
          cellClassRules={{
            [positiveClassNames]: ({
              data,
            }: {
              data: OrderFieldsFragment;
            }) => data?.side === Schema.Side.SIDE_BUY,
            [negativeClassNames]: ({
              data,
            }: {
              data: OrderFieldsFragment;
            }) => data?.side === Schema.Side.SIDE_SELL,
          }}
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: OrderFieldsFragment['size'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            const prefix = data
              ? data.side === Schema.Side.SIDE_BUY
                ? '+'
                : '-'
              : '';
            return (
              prefix + addDecimal(value, data.market.positionDecimalPlaces)
            );
          }}
        />
        <AgGridColumn
          field="type"
          valueFormatter={({
            value,
          }: ValueFormatterParams & {
            value?: OrderFieldsFragment['type'];
          }) => OrderTypeMapping[value as Schema.OrderType]}
        />
        <AgGridColumn
          field="status"
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: OrderFieldsFragment['status'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            if (value === Schema.OrderStatus.STATUS_REJECTED) {
              return `${OrderStatusMapping[value]}: ${
                data.rejectionReason &&
                OrderRejectionReasonMapping[data.rejectionReason]
              }`;
            }
            return OrderStatusMapping[value];
          }}
        />
        <AgGridColumn
          headerName={t('Filled')}
          field="remaining"
          cellClass="font-mono text-right"
          type="rightAligned"
          valueFormatter={({
            data,
            value,
          }: OrderListTableValueFormatterParams & {
            value?: OrderFieldsFragment['remaining'];
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
          type="rightAligned"
          cellClass="font-mono text-right"
          valueFormatter={({
            value,
            data,
          }: OrderListTableValueFormatterParams & {
            value?: OrderFieldsFragment['price'];
          }) => {
            if (
              value === undefined ||
              !data ||
              !data.market ||
              data.type === Schema.OrderType.TYPE_MARKET
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
            value?: OrderFieldsFragment['timeInForce'];
          }) => {
            if (value === undefined || !data || !data.market) {
              return undefined;
            }
            if (
              value === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
              data.expiresAt
            ) {
              const expiry = getDateTimeFormat().format(
                new Date(data.expiresAt)
              );
              return `${OrderTimeInForceMapping[value]}: ${expiry}`;
            }

            return OrderTimeInForceMapping[value];
          }}
        />
        <AgGridColumn
          field="createdAt"
          valueFormatter={({
            value,
          }: OrderListTableValueFormatterParams & {
            value?: OrderFieldsFragment['createdAt'];
          }) => {
            return value ? getDateTimeFormat().format(new Date(value)) : value;
          }}
        />
        <AgGridColumn
          field="updatedAt"
          valueFormatter={({
            value,
          }: OrderListTableValueFormatterParams & {
            value?: OrderFieldsFragment['updatedAt'];
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
                  onClick={() => {
                    setEditOrder(data);
                  }}
                  size="sm"
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
                <Button
                  size="sm"
                  data-testid="cancel"
                  onClick={() => cancel(data)}
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

/**
 * Check if an order is active to determine if it can be edited or cancelled
 */
const isOrderActive = (status: Schema.OrderStatus) => {
  return ![
    Schema.OrderStatus.STATUS_CANCELLED,
    Schema.OrderStatus.STATUS_REJECTED,
    Schema.OrderStatus.STATUS_EXPIRED,
    Schema.OrderStatus.STATUS_FILLED,
    Schema.OrderStatus.STATUS_STOPPED,
    Schema.OrderStatus.STATUS_PARTIALLY_FILLED,
  ].includes(status);
};

const getEditDialogTitle = (status?: Schema.OrderStatus): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_ACTIVE:
      return t('Order updated');
    case Schema.OrderStatus.STATUS_FILLED:
      return t('Order filled');
    case Schema.OrderStatus.STATUS_PARTIALLY_FILLED:
      return t('Order partially filled');
    case Schema.OrderStatus.STATUS_PARKED:
      return t('Order parked');
    case Schema.OrderStatus.STATUS_STOPPED:
      return t('Order stopped');
    case Schema.OrderStatus.STATUS_EXPIRED:
      return t('Order expired');
    case Schema.OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    case Schema.OrderStatus.STATUS_REJECTED:
      return t('Order rejected');
    default:
      return t('Order amendment failed');
  }
};

const getCancelDialogIntent = (status?: Schema.OrderStatus): Intent | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_CANCELLED:
      return Intent.Success;
    default:
      return Intent.Danger;
  }
};

const getCancelDialogTitle = (status?: Schema.OrderStatus): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    default:
      return t('Order cancellation failed');
  }
};
