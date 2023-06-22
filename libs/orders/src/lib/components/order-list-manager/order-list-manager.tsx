import { t } from '@vegaprotocol/i18n';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { OrderListTable } from '../order-list/order-list';
import { useHasAmendableOrder } from '../../order-hooks/use-has-amendable-order';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ordersWithMarketProvider } from '../order-data-provider/order-data-provider';
import {
  normalizeOrderAmendment,
  useVegaTransactionStore,
} from '@vegaprotocol/wallet';
import type { OrderTxUpdateFieldsFragment } from '@vegaprotocol/wallet';
import { OrderEditDialog } from '../order-list/order-edit-dialog';
import type { Order } from '../order-data-provider';

export enum Filter {
  'Open',
  'Closed',
  'Rejected',
}

export interface OrderListManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
  filter?: Filter;
  gridProps?: ReturnType<typeof useDataGridEvents>;
}

export const OrderListManager = ({
  partyId,
  marketId,
  onMarketClick,
  onOrderTypeClick,
  isReadOnly,
  filter,
  gridProps,
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

  const cancelAll = useCallback(() => {
    create({
      orderCancellation: {},
    });
  }, [create]);

  return (
    <>
      <div className="h-full relative">
        <OrderListTable
          rowData={data}
          ref={gridRef}
          filter={filter}
          onCancel={cancel}
          onEdit={setEditOrder}
          onMarketClick={onMarketClick}
          onOrderTypeClick={onOrderTypeClick}
          isReadOnly={isReadOnly}
          suppressAutoSize
          overlayNoRowsTemplate={error ? error.message : t('No orders')}
          {...gridProps}
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
            create({ orderAmendment }, originalOrder);
            setEditOrder(null);
          }}
        />
      )}
    </>
  );
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
