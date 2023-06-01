import compact from 'lodash/compact';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import { useOrderStore } from '@vegaprotocol/orders';
import { DataGridNoRowsOverlay } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const updateOrder = useOrderStore((store) => store.update);

  const { data, error, reload } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    variables: { marketId },
  });
  const trades = compact(data).map((d) => d.node);

  return (
    <TradesTable
      ref={gridRef}
      rowData={trades}
      onClick={(price?: string) => {
        if (price) {
          updateOrder(marketId, { price });
        }
      }}
      noRowsOverlayComponent={() => (
        <DataGridNoRowsOverlay
          error={error}
          message={t('No trades')}
          reload={reload}
        />
      )}
    />
  );
};
