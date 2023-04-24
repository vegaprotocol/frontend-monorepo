import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import type { GridReadyEvent } from 'ag-grid-community';

import { OrderListTable } from '../order-list/order-list';
import { useOrderListData } from './use-order-list-data';
import { useHasAmendableOrder } from '../../order-hooks/use-has-amendable-order';
import type { Filter } from './use-order-list-data';
import { FilterStatus } from './use-order-list-data';
import { useBottomPlaceholder } from '@vegaprotocol/react-helpers';
import {
  normalizeOrderAmendment,
  useVegaTransactionStore,
} from '@vegaprotocol/wallet';
import type { OrderTxUpdateFieldsFragment } from '@vegaprotocol/wallet';
import { OrderEditDialog } from '../order-list/order-edit-dialog';
import type { Order, OrderEdge } from '../order-data-provider';

export interface OrderListManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
  enforceBottomPlaceholder?: boolean;
  filter?: Filter;
}

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
}: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const scrolledToTop = useRef(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const create = useVegaTransactionStore((state) => state.create);
  const hasAmendableOrder = useHasAmendableOrder(marketId);
  const { data, error, loading, reload } = useOrderListData({
    partyId,
    filter,
    gridRef,
    scrolledToTop,
  });

  const {
    onSortChanged: bottomPlaceholderOnSortChanged,
    onFilterChanged: bottomPlaceholderOnFilterChanged,
    ...bottomPlaceholderProps
  } = useBottomPlaceholder<Order>({
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
      if (filter) {
        api.setFilterModel({
          status: {
            value: FilterStatus[filter],
          },
        });
      }
    },
    [filter]
  );

  useEffect(() => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, [data]);

  const cancelAll = useCallback(() => {
    create({
      orderCancellation: {
        marketId,
      },
    });
  }, [create, marketId]);
  const extractedData =
    data && !loading
      ? data
          .filter((item) => item !== null)
          .map((item) => (item as OrderEdge).node)
      : null;

  return (
    <>
      <div className="h-full relative">
        <OrderListTable
          rowData={extractedData}
          ref={gridRef}
          onGridReady={onGridReady}
          cancel={cancel}
          setEditOrder={setEditOrder}
          onMarketClick={onMarketClick}
          onOrderTypeClick={onOrderTypeClick}
          isReadOnly={isReadOnly}
          blockLoadDebounceMillis={100}
          suppressLoadingOverlay
          suppressNoRowsOverlay
          {...bottomPlaceholderProps}
        />
        <div className="pointer-events-none absolute inset-0">
          <AsyncRenderer
            loading={loading}
            error={error}
            data={data}
            noDataMessage={t('No orders')}
            noDataCondition={(data) => !dataCount}
            reload={reload}
          />
        </div>
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
            create({ orderAmendment }, originalOrder);
            setEditOrder(null);
          }}
        />
      )}
    </>
  );
};
