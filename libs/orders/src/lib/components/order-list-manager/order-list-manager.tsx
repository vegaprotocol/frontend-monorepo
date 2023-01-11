import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import { useRef, useState } from 'react';
import type {
  BodyScrollEvent,
  BodyScrollEndEvent,
  FilterChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';

import { OrderListTable } from '../order-list/order-list';
import { useOrderListData } from './use-order-list-data';
import { useHasActiveOrder } from '../../order-hooks/use-has-active-order';
import type { Filter, Sort } from './use-order-list-data';
import { useEnvironment } from '@vegaprotocol/environment';

import { Link } from '@vegaprotocol/ui-toolkit';
import type { TransactionResult } from '@vegaprotocol/wallet';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { useOrderCancel } from '../../order-hooks/use-order-cancel';
import { useOrderEdit } from '../../order-hooks/use-order-edit';
import { OrderFeedback } from '../order-feedback';
import { OrderEditDialog } from '../order-list/order-edit-dialog';
import type { OrderEventFieldsFragment } from '../../order-hooks';
import * as Schema from '@vegaprotocol/types';
import type { Order } from '../order-data-provider';

export interface OrderListManagerProps {
  partyId: string;
  marketId?: string;
}

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
        <p className="text-vega-pink">
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

export const OrderListManager = ({
  partyId,
  marketId,
}: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const [sort, setSort] = useState<Sort[] | undefined>();
  const [filter, setFilter] = useState<Filter | undefined>();
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const orderCancel = useOrderCancel();
  const orderEdit = useOrderEdit(editOrder);
  const hasActiveOrder = useHasActiveOrder(marketId);

  const { data, error, loading, addNewRows, getRows } = useOrderListData({
    partyId,
    marketId,
    sort,
    filter,
    gridRef,
    scrolledToTop,
  });

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  const onFilterChanged = (event: FilterChangedEvent) => {
    const updatedFilter = event.api.getFilterModel();
    if (Object.keys(updatedFilter).length) {
      setFilter(updatedFilter);
    } else if (filter) {
      setFilter(undefined);
    }
  };

  const onSortChange = (event: SortChangedEvent) => {
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
  };

  return (
    <>
      <div className="h-full relative grid grid-rows-[1fr,min-content]">
        <div className="h-full relative">
          <OrderListTable
            ref={gridRef}
            rowModelType="infinite"
            datasource={{ getRows }}
            onBodyScrollEnd={onBodyScrollEnd}
            onBodyScroll={onBodyScroll}
            onFilterChanged={onFilterChanged}
            onSortChanged={onSortChange}
            cancel={(order: Order) => {
              if (!order.market) return;
              orderCancel.cancel({
                orderId: order.id,
                marketId: order.market.id,
              });
            }}
            setEditOrder={setEditOrder}
          />
          <div className="pointer-events-none absolute inset-0">
            <AsyncRenderer
              loading={loading}
              error={error}
              data={data}
              noDataMessage={t('No orders')}
              noDataCondition={(data) => !(data && data.length)}
            />
          </div>
        </div>
        {hasActiveOrder && (
          <div className="w-full dark:bg-black bg-white absolute bottom-0 h-auto flex justify-end px-[11px] py-2">
            <Button
              size="sm"
              onClick={() => orderCancel.cancel({ marketId })}
              data-testid="cancelAll"
            >
              {t('Cancel all')}
            </Button>
          </div>
        )}
      </div>
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
