import { useCallback, useRef, useState, useEffect } from 'react';
import { type AgGridReact } from 'ag-grid-react';
import { Pagination, type useDataGridEvents } from '@vegaprotocol/datagrid';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { normalizeOrderAmendment } from '@vegaprotocol/wallet';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import type { OrderTxUpdateFieldsFragment } from '@vegaprotocol/web3';
import { OrderEditDialog } from '../order-list/order-edit-dialog';
import { type Order } from '../order-data-provider';
import { OrderViewDialog } from '../order-list/order-view-dialog';
import { OrderListTable } from '../order-list';
import { ordersWithMarketProvider } from '../order-data-provider/order-data-provider';
import { useT } from '../../use-t';

export enum Filter {
  'Open' = 'Open',
  'Closed' = 'Closed',
  'Rejected' = 'Rejected',
}

export interface OrderListManagerProps {
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
  filter?: Filter;
  gridProps?: ReturnType<typeof useDataGridEvents>;
  noRowsMessage?: string;
}

export const OrderListManager = ({
  partyId,
  onMarketClick,
  onOrderTypeClick,
  isReadOnly,
  filter,
  gridProps,
  noRowsMessage,
}: OrderListManagerProps) => {
  const t = useT();
  const gridRef = useRef<AgGridReact | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const create = useVegaTransactionStore((state) => state.create);
  const variables =
    filter === Filter.Open
      ? { partyId, filter: { liveOnly: true } }
      : { partyId };

  const { data, error, pageInfo, load } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables,
  });

  useEffect(() => {
    if (!data || !data.length) {
      gridRef.current?.api?.showNoRowsOverlay();
    } else {
      gridRef.current?.api?.hideOverlay();
    }
  }, [data]);

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

  const [hasDisplayedRow, setHasDisplayedRow] = useState<boolean | undefined>(
    undefined
  );
  const { onFilterChanged, ...props } = gridProps || {};
  const onRowDataUpdated = useCallback(
    ({ api }: { api: AgGridReact['api'] }) => {
      setHasDisplayedRow(!!api.getDisplayedRowCount());
    },
    []
  );

  if (error) {
    return (
      <Splash>
        {t(`Something went wrong: {{errorMessage}}`, {
          errorMessage: error.message,
        })}
      </Splash>
    );
  }

  return (
    <>
      <div className="relative flex h-full flex-col">
        <OrderListTable
          rowData={data}
          ref={gridRef}
          filter={filter}
          onCancel={cancel}
          onEdit={setEditOrder}
          onView={setViewOrder}
          onMarketClick={onMarketClick}
          onOrderTypeClick={onOrderTypeClick}
          onFilterChanged={(event) => {
            onRowDataUpdated(event);
            if (onFilterChanged) {
              onFilterChanged(event);
            }
          }}
          onRowDataUpdated={onRowDataUpdated}
          isReadOnly={isReadOnly}
          overlayNoRowsTemplate={noRowsMessage || t('No orders')}
          {...props}
        />
        <Pagination
          count={data?.length || 0}
          pageInfo={pageInfo}
          onLoad={load}
          hasDisplayedRows={hasDisplayedRow || false}
          showRetentionMessage={variables.filter?.liveOnly || true}
        />
      </div>
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
              remaining: editOrder.remaining,
            };
            create({ orderAmendment }, originalOrder);
            setEditOrder(null);
          }}
        />
      )}
      {viewOrder && (
        <OrderViewDialog
          isOpen={Boolean(viewOrder)}
          order={viewOrder}
          onChange={() => setViewOrder(null)}
          onMarketClick={onMarketClick}
        />
      )}
    </>
  );
};
