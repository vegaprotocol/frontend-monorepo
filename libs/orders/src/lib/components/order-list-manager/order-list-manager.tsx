import { t } from '@vegaprotocol/i18n';
import { useCallback, useRef, useState, useEffect } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { OrderListTable } from '../order-list';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '../order-data-provider/order-data-provider';
import { normalizeOrderAmendment } from '@vegaprotocol/wallet';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import type { OrderTxUpdateFieldsFragment } from '@vegaprotocol/web3';
import { OrderEditDialog } from '../order-list/order-edit-dialog';
import type { Order } from '../order-data-provider';
import { OrderViewDialog } from '../order-list/order-view-dialog';
import { Splash, TradingButton as Button } from '@vegaprotocol/ui-toolkit';

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
    update: ({ data }) => {
      if (data && gridRef.current?.api) {
        gridRef.current.api.setRowData(data);
        return true;
      }
      return false;
    },
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
    return <Splash>{t(`Something went wrong: ${error.message}`)}</Splash>;
  }

  return (
    <>
      <div className="h-full relative">
        <div className="flex flex-col h-full">
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
          <div className="flex justify-between border-t border-default p-1 items-center">
            <div className="text-xs">
              {variables.filter?.liveOnly
                ? null
                : t(
                    'Depending on data node retention you may not be able see the "full" history'
                  )}
            </div>
            {data ? (
              <div className="flex text-xs items-center">
                {data?.length && !pageInfo?.hasNextPage
                  ? t('all %s items loaded', [data.length.toString()])
                  : t('%s items loaded', [
                      data?.length ? data.length.toString() : ' ',
                    ])}
                {pageInfo?.hasNextPage ? (
                  <Button
                    size="extra-small"
                    className="ml-1"
                    onClick={() => load()}
                  >
                    {t('Load more')}
                  </Button>
                ) : null}
              </div>
            ) : null}
            {data?.length && hasDisplayedRow === false ? (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
                {t('No orders matching selected filters')}
              </div>
            ) : null}
          </div>
        </div>
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
