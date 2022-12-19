import { useEnvironment } from '@vegaprotocol/environment';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  isNumeric,
  negativeClassNames,
  positiveClassNames,
  t,
  truncateByChars,
  SetFilter,
  DateRangeFilter,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  AgGridDynamic as AgGrid,
  Button,
  Intent,
  Link,
} from '@vegaprotocol/ui-toolkit';
import type { TransactionResult } from '@vegaprotocol/wallet';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { AgGridColumn } from 'ag-grid-react';
import BigNumber from 'bignumber.js';
import { forwardRef, useMemo, useState } from 'react';
import type { TypedDataAgGrid } from '@vegaprotocol/ui-toolkit';
import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderFeedback } from '../order-feedback';
import { OrderEditDialog } from './order-edit-dialog';

import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import type { Order } from '../order-data-provider';
import type { OrderEventFieldsFragment } from '../../order-hooks';

type OrderListProps = TypedDataAgGrid<Order> & { marketId?: string };

export const TransactionComplete = ({
  transaction,
  transactionResult,
}: {
  transaction: VegaTxState;
  transactionResult?: TransactionResult;
}) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  if (!transactionResult) return null;
  return (
    <>
      {transactionResult.status ? (
        <p>{t('Transaction successful')}</p>
      ) : (
        <p className="text-vega-red">
          {t('Transaction failed')}: {transactionResult.error}
        </p>
      )}
      {transaction.txHash && (
        <>
          <p className="font-semibold mt-4">{t('Transaction')}</p>
          <p>
            <Link
              href={`${VEGA_EXPLORER_URL}/txs/${transaction.txHash}`}
              target="_blank"
            >
              {truncateByChars(transaction.txHash)}
            </Link>
          </p>
        </>
      )}
    </>
  );
};

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  (props, ref) => {
    const [editOrder, setEditOrder] = useState<Order | null>(null);
    const orderCancel = useOrderCancel();
    const orderEdit = useOrderEdit(editOrder);

    return (
      <>
        <OrderListTable
          {...props}
          cancelAll={() => {
            orderCancel.cancel({
              marketId: props.marketId,
            });
          }}
          cancel={(order: Order) => {
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
          title={getCancelDialogTitle(orderCancel)}
          intent={getCancelDialogIntent(orderCancel)}
          content={{
            Complete: orderCancel.cancelledOrder ? (
              <OrderFeedback
                transaction={orderCancel.transaction}
                order={orderCancel.cancelledOrder}
              />
            ) : (
              <TransactionComplete {...orderCancel} />
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
              orderEdit.edit({ price: fields.limitPrice, size: fields.size });
            }}
          />
        )}
      </>
    );
  }
);

export type OrderListTableProps = OrderListProps & {
  cancel: (order: Order) => void;
  cancelAll: () => void;
  setEditOrder: (order: Order) => void;
};

export const OrderListTable = forwardRef<AgGridReact, OrderListTableProps>(
  ({ cancel, cancelAll, setEditOrder, ...props }, ref) => {
    return (
      <AgGrid
        ref={ref}
        overlayNoRowsTemplate="No orders"
        defaultColDef={{
          flex: 1,
          resizable: true,
          filterParams: { buttons: ['reset'] },
        }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data.id}
        rowHeight={34}
        pinnedBottomRowData={[{}]}
        {...props}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.code"
          filter
          cellRenderer={({
            value,
            data,
          }: VegaICellRendererParams<
            Order,
            'market.tradableInstrument.instrument.code'
          >) =>
            data?.market?.id ? (
              <Link href={`/#/markets/${data?.market?.id}`}>{value}</Link>
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
            node,
          }: VegaValueFormatterParams<Order, 'size'>) => {
            if (node?.rowPinned) {
              return '';
            }
            if (!data?.market || !isNumeric(value)) {
              return '-';
            }
            const prefix = data
              ? data.side === Schema.Side.SIDE_BUY
                ? '+'
                : '-'
              : '';
            return (
              prefix +
              addDecimalsFormatNumber(value, data.market.positionDecimalPlaces)
            );
          }}
        />
        <AgGridColumn
          field="type"
          filter={SetFilter}
          filterParams={{
            set: Schema.OrderTypeMapping,
          }}
          valueFormatter={({
            data: order,
            value,
            node,
          }: VegaValueFormatterParams<Order, 'type'>) => {
            if (node?.rowPinned) {
              return '';
            }
            if (!value) return '-';
            if (order?.peggedOrder) return t('Pegged');
            if (order?.liquidityProvision) return t('Liquidity provision');
            return Schema.OrderTypeMapping[value];
          }}
        />
        <AgGridColumn
          field="status"
          filter={SetFilter}
          filterParams={{
            set: Schema.OrderStatusMapping,
          }}
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<Order, 'status'>) => {
            if (value === Schema.OrderStatus.STATUS_REJECTED) {
              return `${Schema.OrderStatusMapping[value]}: ${
                data?.rejectionReason &&
                Schema.OrderRejectionReasonMapping[data.rejectionReason]
              }`;
            }
            return value ? Schema.OrderStatusMapping[value] : '';
          }}
          cellRenderer={({
            valueFormatted,
            data,
          }: {
            valueFormatted: string;
            data: Order;
          }) => (
            <span data-testid={`order-status-${data?.id}`}>
              {valueFormatted}
            </span>
          )}
        />
        <AgGridColumn
          headerName={t('Filled')}
          field="remaining"
          cellClass="font-mono text-right"
          type="rightAligned"
          valueFormatter={({
            data,
            value,
            node,
          }: VegaValueFormatterParams<Order, 'remaining'>) => {
            if (node?.rowPinned) {
              return '';
            }
            if (!data?.market || !isNumeric(value) || !isNumeric(data.size)) {
              return '-';
            }
            const dps = data.market.positionDecimalPlaces;
            const size = new BigNumber(data.size);
            const remaining = new BigNumber(value);
            const fills = size.minus(remaining);
            return `${addDecimalsFormatNumber(
              fills.toString(),
              dps
            )}/${addDecimalsFormatNumber(size.toString(), dps)}`;
          }}
        />
        <AgGridColumn
          field="price"
          type="rightAligned"
          cellClass="font-mono text-right"
          valueFormatter={({
            value,
            data,
            node,
          }: VegaValueFormatterParams<Order, 'price'>) => {
            if (node?.rowPinned) {
              return '';
            }
            if (
              !data?.market ||
              data.type === Schema.OrderType.TYPE_MARKET ||
              !isNumeric(value)
            ) {
              return '-';
            }
            return addDecimalsFormatNumber(value, data.market.decimalPlaces);
          }}
        />
        <AgGridColumn
          field="timeInForce"
          filter={SetFilter}
          filterParams={{
            set: Schema.OrderTimeInForceMapping,
          }}
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
              return `${Schema.OrderTimeInForceMapping[value]}: ${expiry}`;
            }

            return value ? Schema.OrderTimeInForceMapping[value] : '';
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
          filter={DateRangeFilter}
          valueFormatter={({
            value,
            node,
          }: VegaValueFormatterParams<Order, 'updatedAt'>) => {
            if (node?.rowPinned) {
              return '';
            }
            return value ? getDateTimeFormat().format(new Date(value)) : '-';
          }}
        />
        <AgGridColumn
          colId="amend"
          headerName=""
          field="status"
          minWidth={150}
          cellRenderer={({ data, node }: VegaICellRendererParams<Order>) => {
            if (node?.rowPinned) {
              return (
                <div className="flex gap-2 items-center h-full justify-end">
                  <Button
                    size="xs"
                    data-testid="cancelAll"
                    onClick={() => cancelAll()}
                  >
                    {t('Cancel all')}
                  </Button>
                </div>
              );
            }
            if (isOrderAmendable(data)) {
              return data ? (
                <div className="flex gap-2 items-center h-full justify-end">
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

export const getCancelDialogIntent = ({
  cancelledOrder,
  transactionResult,
}: {
  cancelledOrder: OrderEventFieldsFragment | null;
  transactionResult?: TransactionResult;
}): Intent | undefined => {
  if (cancelledOrder) {
    if (cancelledOrder.status === Schema.OrderStatus.STATUS_CANCELLED) {
      return Intent.Success;
    }
    return Intent.Danger;
  }
  if (transactionResult) {
    if ('error' in transactionResult && transactionResult.error) {
      return Intent.Danger;
    }
    return Intent.Success;
  }
  return;
};

export const getCancelDialogTitle = ({
  cancelledOrder,
  transactionResult,
}: {
  cancelledOrder: OrderEventFieldsFragment | null;
  transactionResult?: TransactionResult;
}): string | undefined => {
  if (cancelledOrder) {
    if (cancelledOrder.status === Schema.OrderStatus.STATUS_CANCELLED) {
      return t('Order cancelled');
    }
    return t('Order cancellation failed');
  }
  if (transactionResult) {
    if (transactionResult.status) {
      return t('Orders cancelled');
    }
    return t('Orders not cancelled');
  }
  return;
};
