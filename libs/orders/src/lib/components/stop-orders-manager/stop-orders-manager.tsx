import { t } from '@vegaprotocol/i18n';
import { useCallback, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { StopOrdersTable } from '../stop-orders-table/stop-orders-table';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import type { StopOrder } from '../order-data-provider/stop-orders-data-provider';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { stopOrdersWithMarketProvider } from '../order-data-provider/stop-orders-data-provider';

export interface StopOrdersManagerProps {
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
  gridProps?: ReturnType<typeof useDataGridEvents>;
}

export const StopOrdersManager = ({
  partyId,
  onMarketClick,
  isReadOnly,
  gridProps,
}: StopOrdersManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const create = useVegaTransactionStore((state) => state.create);
  const variables = { partyId };

  const { data, error } = useDataProvider({
    dataProvider: stopOrdersWithMarketProvider,
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
    (order: StopOrder) => {
      if (!order.market) return;
      create({
        stopOrdersCancellation: {
          stopOrderId: order.id,
          marketId: order.market.id,
        },
      });
    },
    [create]
  );

  return (
    <StopOrdersTable
      rowData={data}
      ref={gridRef}
      onCancel={cancel}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      suppressAutoSize
      overlayNoRowsTemplate={error ? error.message : t('No stop orders')}
      {...gridProps}
    />
  );
};
