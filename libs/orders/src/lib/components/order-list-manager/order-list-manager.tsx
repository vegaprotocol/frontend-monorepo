import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FilterChangedEvent, SortChangedEvent } from 'ag-grid-community';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import type { GridReadyEvent } from 'ag-grid-community';

import { OrderListTable } from '../order-list/order-list';
import { useOrderListData } from './use-order-list-data';
import { useHasActiveOrder } from '../../order-hooks/use-has-active-order';
import type { Filter, Sort } from './use-order-list-data';
import { useBottomPlaceholder } from '@vegaprotocol/react-helpers';
import { OrderStatus } from '@vegaprotocol/types';
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
  onMarketClick?: (marketId: string) => void;
  isReadOnly: boolean;
  enforceBottomPlaceholder: boolean;
}

const CancelAllOrdersButton = ({
  onClick,
  marketId,
}: {
  onClick: (marketId?: string) => void;
  marketId?: string;
}) => {
  const hasActiveOrder = useHasActiveOrder(marketId);
  return hasActiveOrder ? (
    <div className="dark:bg-black/75 bg-white/75 h-auto flex justify-end px-[11px] py-2 absolute bottom-0 right-3 rounded">
      <Button
        variant="primary"
        size="sm"
        onClick={() => onClick(marketId)}
        data-testid="cancelAll"
      >
        {t('Cancel all')}
      </Button>
    </div>
  ) : null;
};

const initialFilter: Filter = {
  status: {
    value: [OrderStatus.STATUS_ACTIVE, OrderStatus.STATUS_PARKED],
  },
};

export const OrderListManager = ({
  partyId,
  marketId,
  onMarketClick,
  isReadOnly,
  enforceBottomPlaceholder,
}: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const scrolledToTop = useRef(false);
  const [sort, setSort] = useState<Sort[] | undefined>();
  const [filter, setFilter] = useState<Filter | undefined>(initialFilter);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const create = useVegaTransactionStore((state) => state.create);
  const hasActiveOrder = useHasActiveOrder(marketId);

  const { data, error, loading, reload } = useOrderListData({
    partyId,
    sort,
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
    disabled: !enforceBottomPlaceholder && !isReadOnly && !hasActiveOrder,
  });

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      const updatedFilter = event.api.getFilterModel();
      if (Object.keys(updatedFilter).length) {
        setFilter(updatedFilter);
      } else {
        setFilter(undefined);
      }
      setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
      bottomPlaceholderOnFilterChanged?.();
    },
    [setFilter, bottomPlaceholderOnFilterChanged]
  );

  const onSortChange = useCallback(
    (event: SortChangedEvent) => {
      const sort = event.columnApi
        .getColumnState()
        .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
        .reduce((acc, col) => {
          if (col.sort) {
            const { colId, sort } = col;
            acc.push({ colId, sort });
          }
          return acc;
        }, [] as { colId: string; sort: string }[]);
      setSort(sort.length > 0 ? sort : undefined);
      bottomPlaceholderOnSortChanged?.();
    },
    [setSort, bottomPlaceholderOnSortChanged]
  );

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

  const onGridReady = useCallback(({ api }: GridReadyEvent) => {
    api.setFilterModel(initialFilter);
  }, []);

  useEffect(() => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, [data]);

  const cancelAll = useCallback(
    (marketId?: string) => {
      create({
        orderCancellation: {
          marketId,
        },
      });
    },
    [create]
  );
  const extractNodesDecorator = useCallback(
    (data: (OrderEdge | null)[] | null, loading: boolean) =>
      data && !loading
        ? data
            .filter((item) => item !== null)
            .map((item) => (item as OrderEdge).node)
        : null,
    []
  );
  const extractedData = extractNodesDecorator(data, loading);

  return (
    <>
      <div className="h-full relative">
        <OrderListTable
          rowData={extractedData}
          ref={gridRef}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onSortChanged={onSortChange}
          cancel={cancel}
          setEditOrder={setEditOrder}
          onMarketClick={onMarketClick}
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
      {!isReadOnly && (
        <CancelAllOrdersButton onClick={cancelAll} marketId={marketId} />
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
