import { useDataProvider } from '@vegaprotocol/data-provider';
import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import { useCreateOrderStore } from '@vegaprotocol/orders';
import { t } from '@vegaprotocol/i18n';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const useOrderStoreRef = useCreateOrderStore();
  const updateOrder = useOrderStoreRef((store) => store.update);

  const { data, error } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    variables: { marketId },
  });

  return (
    <TradesTable
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
