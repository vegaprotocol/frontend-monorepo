import {
  OrderTimeInForce,
  OrderStatus,
  Side,
  OrderType,
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
  isNumeric,
} from '@vegaprotocol/react-helpers';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import {
  AgGridDynamic as AgGrid,
  Button,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef, useState } from 'react';
import BigNumber from 'bignumber.js';

import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderEditDialog } from './order-edit-dialog';
import type { Order } from '../';
import { OrderFeedback } from '../order-feedback';

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
        />
        <AgGridColumn
          headerName={t('Size')}
          field="size"
          cellClass="font-mono text-right"
          type="rightAligned"
          cellClassRules={{
            [positiveClassNames]: ({ data }: { data: Order }) =>
              data?.side === Side.SIDE_BUY,
            [negativeClassNames]: ({ data }: { data: Order }) =>
              data?.side === Side.SIDE_SELL,
          }}
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<Order, 'size'>) => {
            if (!data?.market || !isNumeric(value)) {
              return '-';
            }
            const prefix = data
              ? data.side === Side.SIDE_BUY
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
            if (value === OrderStatus.STATUS_REJECTED) {
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
              data.type === OrderType.TYPE_MARKET ||
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
              value === OrderTimeInForce.TIME_IN_FORCE_GTT &&
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
export const isOrderActive = (status: OrderStatus) => {
  return ![
    OrderStatus.STATUS_CANCELLED,
    OrderStatus.STATUS_REJECTED,
    OrderStatus.STATUS_EXPIRED,
    OrderStatus.STATUS_FILLED,
    OrderStatus.STATUS_STOPPED,
    OrderStatus.STATUS_PARTIALLY_FILLED,
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
  status?: OrderStatus
): string | undefined => {
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
    case OrderStatus.STATUS_STOPPED:
      return t('Order stopped');
    case OrderStatus.STATUS_EXPIRED:
      return t('Order expired');
    case OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    case OrderStatus.STATUS_REJECTED:
      return t('Order rejected');
    default:
      return t('Order amendment failed');
  }
};

export const getCancelDialogIntent = (
  status?: OrderStatus
): Intent | undefined => {
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

export const getCancelDialogTitle = (
  status?: OrderStatus
): string | undefined => {
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
