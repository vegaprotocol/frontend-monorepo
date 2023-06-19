import { t } from '@vegaprotocol/i18n';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import type { GridReadyEvent, FilterChangedEvent } from 'ag-grid-community';

import { OrderListTable } from '../order-list/order-list';
import { useHasAmendableOrder } from '../../order-hooks/use-has-amendable-order';
import { useBottomPlaceholder } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '../order-data-provider/order-data-provider';
import type { Transaction, OrderAmendment } from '@vegaprotocol/wallet';
import { TimeInForceMap, useVegaTransactionStore } from '@vegaprotocol/wallet';
import type { OrderTxUpdateFieldsFragment } from '@vegaprotocol/wallet';
import { OrderEditDialog } from '../order-list/order-edit-dialog';
import type { Order } from '../order-data-provider';
import type { Exact } from 'type-fest';
import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import * as Schema from '@vegaprotocol/types';

export enum Filter {
  'Open',
  'Closed',
  'Rejected',
}

const FilterStatusValue = {
  [Filter.Open]: [
    Schema.OrderStatus.STATUS_ACTIVE,
    Schema.OrderStatus.STATUS_PARKED,
  ],
  [Filter.Closed]: [
    Schema.OrderStatus.STATUS_CANCELLED,
    Schema.OrderStatus.STATUS_EXPIRED,
    Schema.OrderStatus.STATUS_FILLED,
    Schema.OrderStatus.STATUS_PARTIALLY_FILLED,
    Schema.OrderStatus.STATUS_STOPPED,
  ],
  [Filter.Rejected]: [Schema.OrderStatus.STATUS_REJECTED],
};

export interface OrderListManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
  enforceBottomPlaceholder?: boolean;
  filter?: Filter;
  storeKey?: string;
}

export interface DealTicketOrderAmendment {
  marketId: string;
  orderId: string;
  reference?: string;
  timeInForce: Schema.OrderTimeInForce;
  sizeDelta?: number;
  price?: string;
  expiresAt?: string;
}

export const normalizeOrderAmendment = <T extends Exact<OrderAmendment, T>>(
  order: Pick<Order, 'id' | 'timeInForce' | 'size' | 'expiresAt'>,
  market: Pick<Schema.Market, 'id' | 'decimalPlaces' | 'positionDecimalPlaces'>,
  price: string,
  size: string
): DealTicketOrderAmendment => ({
  orderId: order.id,
  marketId: market.id,
  price: removeDecimal(price, market.decimalPlaces),
  timeInForce: order.timeInForce,
  sizeDelta: size
    ? new BigNumber(removeDecimal(size, market.positionDecimalPlaces))
        .minus(order.size)
        .toNumber()
    : 0,
  expiresAt: order.expiresAt
    ? toNanoSeconds(order.expiresAt) // Wallet expects timestamp in nanoseconds
    : undefined,
});

export const convertDealTicketToOrderAmendment = (
  dealTicketOrder: DealTicketOrderAmendment
) => {
  return {
    ...dealTicketOrder,
    expiresAt: dealTicketOrder.expiresAt
      ? BigInt(dealTicketOrder.expiresAt)
      : null,
    timeInForce: TimeInForceMap[dealTicketOrder.timeInForce],
    sizeDelta: BigInt(dealTicketOrder.sizeDelta || 0),
  } as OrderAmendment;
};

const CancelAllOrdersButton = ({ onClick }: { onClick: () => void }) => (
  <div className="dark:bg-black/75 bg-white/75 h-auto flex justify-end px-[11px] py-2 absolute bottom-0 right-3 rounded">
    <Button
      variant="primary"
      size="sm"
      onClick={onClick}
      data-testid="cancelAll"
    >
      {t('Cancel all')}
    </Button>
  </div>
);

export const OrderListManager = ({
  partyId,
  marketId,
  onMarketClick,
  onOrderTypeClick,
  isReadOnly,
  enforceBottomPlaceholder,
  filter,
  storeKey,
}: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const create = useVegaTransactionStore((state) => state.create);
  const hasAmendableOrder = useHasAmendableOrder(marketId);
  const variables =
    filter === Filter.Open
      ? { partyId, filter: { liveOnly: true } }
      : { partyId };

  const { data, error } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables,
    update: ({ data }) => {
      if (data && gridRef.current?.api) {
        gridRef.current.api.setRowData(data);
        return true;
      }
      return false;
    },
  });

  const {
    onFilterChanged: bottomPlaceholderOnFilterChanged,
    ...bottomPlaceholderProps
  } = useBottomPlaceholder({
    gridRef,
    disabled: !enforceBottomPlaceholder && !isReadOnly && !hasAmendableOrder,
  });

  const cancel = useCallback(
    (order: Order) => {
      if (!order.market) return;
      create({
        orderCancellation: {
          orderId: order.id,
          marketId: order.market.id,
        },
      });
    },
    [create]
  );

  const onGridReady = useCallback(
    ({ api }: GridReadyEvent) => {
      if (filter !== undefined) {
        api.setFilterModel({
          status: {
            value: FilterStatusValue[filter],
          },
        });
      }
    },
    [filter]
  );

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      bottomPlaceholderOnFilterChanged?.();
    },
    [bottomPlaceholderOnFilterChanged]
  );

  const cancelAll = useCallback(() => {
    create({
      orderCancellation: {},
    } as Transaction);
  }, [create]);

  return (
    <>
      <div className="h-full relative">
        <OrderListTable
          rowData={data as Order[]}
          ref={gridRef}
          filter={filter}
          onGridReady={onGridReady}
          onCancel={cancel}
          onEdit={setEditOrder}
          onMarketClick={onMarketClick}
          onOrderTypeClick={onOrderTypeClick}
          onFilterChanged={onFilterChanged}
          isReadOnly={isReadOnly}
          storeKey={storeKey}
          suppressAutoSize
          overlayNoRowsTemplate={error ? error.message : t('No orders')}
          {...bottomPlaceholderProps}
        />
      </div>
      {!isReadOnly && hasAmendableOrder && (
        <CancelAllOrdersButton onClick={cancelAll} />
      )}
      {editOrder && (
        <OrderEditDialog
          isOpen={Boolean(editOrder)}
          onChange={(isOpen) => {
            if (!isOpen) setEditOrder(null);
          }}
          order={editOrder}
          onSubmit={(fields) => {
            if (!editOrder.market) {
              return;
            }
            const orderAmendment = normalizeOrderAmendment(
              editOrder,
              editOrder.market,
              fields.limitPrice,
              fields.size
            );
            const originalOrder: OrderTxUpdateFieldsFragment = {
              type: editOrder.type,
              id: editOrder.id,
              status: editOrder.status,
              createdAt: editOrder.createdAt,
              size: editOrder.size,
              price: editOrder.price,
              timeInForce: editOrder.timeInForce,
              expiresAt: editOrder.expiresAt,
              side: editOrder.side,
              marketId: editOrder.market.id,
            };
            create(
              {
                orderAmendment:
                  convertDealTicketToOrderAmendment(orderAmendment),
              },
              originalOrder
            );
            setEditOrder(null);
          }}
        />
      )}
    </>
  );
};
