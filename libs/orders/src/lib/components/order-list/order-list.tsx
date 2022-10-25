import {
  addDecimal,
  getDateTimeFormat,
  isNumeric,
  negativeClassNames,
  positiveClassNames,
  t,
} from '@vegaprotocol/react-helpers';
import {
  OrderRejectionReasonMapping,
  OrderStatusMapping,
  OrderTimeInForceMapping,
  OrderTypeMapping,
  Schema,
} from '@vegaprotocol/types';
import {
  AgGridDynamic as AgGrid,
  Button,
  Intent,
  Link,
} from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import BigNumber from 'bignumber.js';
import { forwardRef, useState } from 'react';

import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderFeedback } from '../order-feedback';
import { OrderEditDialog } from './order-edit-dialog';

import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { Order } from '../';
type OrderListProps = AgGridReactProps;

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  (props, ref) => {
    const [editOrder, setEditOrder] = useState<Order | null>(null);
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
          content={{
            Complete: (
              <OrderFeedback
                transaction={orderCancel.transaction}
                order={orderCancel.cancelledOrder}
              />
            ),
          }}
        />
        <orderEdit.Dialog
          title={getEditDialogTitle(orderEdit.updatedOrder?.status)}
          content={{
            Complete: (
              <OrderFeedback
                transaction={orderEdit.transaction}
                order={orderEdit.updatedOrder}
              />
            ),
          }}
        />
        {editOrder && (
          <OrderEditDialog
            isOpen={Boolean(editOrder)}
            onChange={(isOpen) => {
              if (!isOpen) setEditOrder(null);
            }}
            order={editOrder}
            onSubmit={(fields) => {
              setEditOrder(null);
              orderEdit.edit({ price: fields.limitPrice });
            }}
          />
        )}
      </>
    );
  }
);

export type OrderListTableProps = AgGridReactProps & {
  cancel: (order: Order) => void;
  setEditOrder: (order: Order) => void;
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
          cellRenderer={({
            value,
            data,
          }: VegaICellRendererParams<
            Order,
            'market.tradableInstrument.instrument.code'
          >) =>
            data?.market?.id ? (
              <Link href={`/markets/${data?.market?.id}`} target="_blank">
                {value}
              </Link>
            ) : (
              value
            )
          }
        />
        <AgGridColumn
          headerName={t('Size')}
          field="size"
          cellClass="font-mono text-right"
          type="rightAligned"
          cellClassRules={{
            [positiveClassNames]: ({ data }: { data: Order }) =>
              data?.side === Schema.Side.SIDE_BUY,
            [negativeClassNames]: ({ data }: { data: Order }) =>
              data?.side === Schema.Side.SIDE_SELL,
          }}
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<Order, 'size'>) => {
            if (!data?.market || !isNumeric(value)) {
              return '-';
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
            data: order,
            value,
          }: VegaValueFormatterParams<Order, 'type'>) => {
            if (!value) return '-';
            if (order?.peggedOrder) return t('Pegged');
            if (order?.liquidityProvision) return t('Liquidity provision');
            return OrderTypeMapping[value];
          }}
        />
        <AgGridColumn
          field="status"
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<Order, 'status'>) => {
            if (value === Schema.OrderStatus.STATUS_REJECTED) {
              return `${OrderStatusMapping[value]}: ${
                data?.rejectionReason &&
                OrderRejectionReasonMapping[data.rejectionReason]
              }`;
            }
            return value ? OrderStatusMapping[value] : '';
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
          }: VegaValueFormatterParams<Order, 'remaining'>) => {
            if (!data?.market || !isNumeric(value) || !isNumeric(data.size)) {
              return '-';
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
          }: VegaValueFormatterParams<Order, 'price'>) => {
            if (
              !data?.market ||
              data.type === Schema.OrderType.TYPE_MARKET ||
              !isNumeric(value)
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
          }: VegaValueFormatterParams<Order, 'timeInForce'>) => {
            if (
              value === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
              data?.expiresAt
            ) {
              const expiry = getDateTimeFormat().format(
                new Date(data.expiresAt)
              );
              return `${OrderTimeInForceMapping[value]}: ${expiry}`;
            }

            return value ? OrderTimeInForceMapping[value] : '';
          }}
        />
        <AgGridColumn
          field="createdAt"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Order, 'createdAt'>) => {
            return value ? getDateTimeFormat().format(new Date(value)) : value;
          }}
        />
        <AgGridColumn
          field="updatedAt"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Order, 'updatedAt'>) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '-';
          }}
        />
        <AgGridColumn
          colId="amend"
          headerName=""
          field="status"
          cellRenderer={({ data }: VegaICellRendererParams<Order>) => {
            if (isOrderAmendable(data)) {
              return data ? (
                <div className="flex gap-2">
                  <Button
                    data-testid="edit"
                    onClick={() => setEditOrder(data)}
                    size="xs"
                  >
                    {t('Edit')}
                  </Button>
                  <Button
                    size="xs"
                    data-testid="cancel"
                    onClick={() => cancel(data)}
                  >
                    {t('Cancel')}
                  </Button>
                </div>
              ) : null;
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
export const isOrderActive = (status: Schema.OrderStatus) => {
  return ![
    Schema.OrderStatus.STATUS_CANCELLED,
    Schema.OrderStatus.STATUS_REJECTED,
    Schema.OrderStatus.STATUS_EXPIRED,
    Schema.OrderStatus.STATUS_FILLED,
    Schema.OrderStatus.STATUS_STOPPED,
    Schema.OrderStatus.STATUS_PARTIALLY_FILLED,
  ].includes(status);
};

export const isOrderAmendable = (order: Order | undefined) => {
  if (!order || order.peggedOrder || order.liquidityProvision) {
    return false;
  }

  if (isOrderActive(order.status)) {
    return true;
  }

  return false;
};

export const getEditDialogTitle = (
  status?: Schema.OrderStatus
): string | undefined => {
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

export const getCancelDialogIntent = (
  status?: Schema.OrderStatus
): Intent | undefined => {
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

export const getCancelDialogTitle = (
  status?: Schema.OrderStatus
): string | undefined => {
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
