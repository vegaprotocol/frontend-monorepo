import { useCallback, useState } from 'react';
import { StopOrdersTable } from '../stop-orders-table/stop-orders-table';
import { type useDataGridEvents } from '@vegaprotocol/datagrid';
import { type StopOrder } from '../order-data-provider/stop-orders-data-provider';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { stopOrdersWithMarketProvider } from '../order-data-provider/stop-orders-data-provider';
import { OrderViewDialog } from '../order-list/order-view-dialog';
import {
  type Order,
  type StopOrdersQueryVariables,
} from '../order-data-provider';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useT } from '../../use-t';

export interface StopOrdersManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
  gridProps?: ReturnType<typeof useDataGridEvents>;
}

export const StopOrdersManager = ({
  partyId,
  marketId,
  onMarketClick,
  isReadOnly,
  gridProps,
}: StopOrdersManagerProps) => {
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const variables: StopOrdersQueryVariables = {
    filter: {
      parties: [partyId],
      markets: marketId ? [marketId] : undefined,
    },
  };

  const { data, error } = useDataProvider({
    dataProvider: stopOrdersWithMarketProvider,
    variables,
  });

  const cancel = useCallback(
    (order: StopOrder) => {
      if (!order.submission.marketId) return;
      create({
        stopOrdersCancellation: {
          stopOrderId: order.id,
          marketId: order.submission.marketId,
        },
      });
    },
    [create]
  );

  return (
    <>
      <StopOrdersTable
        rowData={data}
        onCancel={cancel}
        onView={setViewOrder}
        onMarketClick={onMarketClick}
        isReadOnly={isReadOnly}
        suppressAutoSize
        overlayNoRowsTemplate={error ? error.message : t('No stop orders')}
        {...gridProps}
      />
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
