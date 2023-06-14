import { useDataProvider } from '@vegaprotocol/data-provider';
import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import { useOrderStore } from '@vegaprotocol/orders';
import { t } from '@vegaprotocol/i18n';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const updateOrder = useOrderStore((store) => store.update);

  const { data, error } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    variables: { marketId },
  });

  return (
    <TradesTable
      ref={gridRef}
      rowData={data}
      onClick={(price?: string) => {
        if (price) {
          updateOrder(marketId, { price });
        }
      }}
      overlayNoRowsTemplate={error ? error.message : t('No trades')}
    />
  );
};
