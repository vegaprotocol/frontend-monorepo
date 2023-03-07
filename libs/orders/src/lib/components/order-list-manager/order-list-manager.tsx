import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useCallback, useRef, useState } from 'react';
import type {
  BodyScrollEvent,
  BodyScrollEndEvent,
  FilterChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { OrderListTable } from '../order-list/order-list';
import { useOrderListData } from './use-order-list-data';
import { useHasActiveOrder } from '../../order-hooks/use-has-active-order';
import type { Filter, Sort } from './use-order-list-data';
import {
  normalizeOrderAmendment,
  useVegaTransactionStore,
} from '@vegaprotocol/wallet';
import type { OrderTxUpdateFieldsFragment } from '@vegaprotocol/wallet';
import { OrderEditDialog } from '../order-list/order-edit-dialog';
import type { Order } from '../order-data-provider';
import { useBottomPlaceholder } from '@vegaprotocol/react-helpers';

export interface OrderListManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string) => void;
  isReadOnly: boolean;
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

export const OrderListManager = ({
  partyId,
  marketId,
  onMarketClick,
  isReadOnly,
}: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const [sort, setSort] = useState<Sort[] | undefined>();
  const [filter, setFilter] = useState<Filter | undefined>();
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const create = useVegaTransactionStore((state) => state.create);
  const hasActiveOrder = useHasActiveOrder(marketId);

  const {
    data,
    error,
    loading,
    addNewRows,
    getRows,
    reload,
    makeBottomPlaceholders,
  } = useOrderListData({
    partyId,
    marketId,
    sort,
    filter,
    gridRef,
    scrolledToTop,
  });

  const checkBottomPlaceholder = useCallback(() => {
    if (!isReadOnly && hasActiveOrder) {
      const rowCont = gridRef.current?.api?.getModel().getRowCount() ?? 0;
      const lastRowIndex = gridRef.current?.api?.getLastDisplayedRow();
      if (lastRowIndex && rowCont - 1 === lastRowIndex) {
        const lastrow =
          gridRef.current?.api.getDisplayedRowAtIndex(lastRowIndex);
        lastrow?.setRowHeight(50);
        makeBottomPlaceholders(lastrow?.data);
        gridRef.current?.api.onRowHeightChanged();
        gridRef.current?.api.refreshInfiniteCache();
      }
    }
  }, [isReadOnly, hasActiveOrder, makeBottomPlaceholders]);

  const onBodyScrollEnd = useCallback(
    (event: BodyScrollEndEvent) => {
      if (event.top === 0) {
        addNewRows();
      }
      checkBottomPlaceholder();
    },
    [addNewRows, checkBottomPlaceholder]
  );

  const onBodyScroll = useCallback((event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  }, []);

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      makeBottomPlaceholders();
      const updatedFilter = event.api.getFilterModel();
      if (Object.keys(updatedFilter).length) {
        setFilter(updatedFilter);
      } else {
        setFilter(undefined);
      }
      checkBottomPlaceholder();
    },
    [setFilter, makeBottomPlaceholders, checkBottomPlaceholder]
  );

  const onSortChange = useCallback(
    (event: SortChangedEvent) => {
      makeBottomPlaceholders();
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
      checkBottomPlaceholder();
    },
    [setSort, makeBottomPlaceholders, checkBottomPlaceholder]
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
  const { isFullWidthRow, fullWidthCellRenderer, rowClassRules } =
    useBottomPlaceholder<Order>({
      gridRef,
    });

  return (
    <>
      <div className="h-full relative">
        <OrderListTable
          ref={gridRef}
          rowModelType="infinite"
          datasource={{ getRows }}
          onBodyScrollEnd={onBodyScrollEnd}
          onBodyScroll={onBodyScroll}
          onFilterChanged={onFilterChanged}
          onSortChanged={onSortChange}
          cancel={cancel}
          setEditOrder={setEditOrder}
          onMarketClick={onMarketClick}
          isReadOnly={isReadOnly}
          blockLoadDebounceMillis={100}
          suppressLoadingOverlay
          suppressNoRowsOverlay
          isFullWidthRow={isFullWidthRow}
          fullWidthCellRenderer={fullWidthCellRenderer}
          rowClassRules={rowClassRules}
        />
        <div className="pointer-events-none absolute inset-0">
          <AsyncRenderer
            loading={loading}
            error={error}
            data={data}
            noDataMessage={t('No orders')}
            noDataCondition={(data) => !(data && data.length)}
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
