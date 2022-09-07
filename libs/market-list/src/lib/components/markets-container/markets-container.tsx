import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { RowClickedEvent } from 'ag-grid-community';
import { marketsWithDataProvider as dataProvider } from '../../markets-data-provider';
import type { MarketWithData } from '../../markets-data-provider';

interface MarketsContainerProps {
  onSelect: (marketId: string) => void;
}

export const MarketsContainer = ({ onSelect }: MarketsContainerProps) => {
  const { data, error, loading } = useDataProvider<MarketWithData[], never>({
    dataProvider,
    update: () => true,
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <MarketListTable
        rowData={data}
        onRowClicked={(rowEvent: RowClickedEvent) => {
          const { data, event } = rowEvent;
          // filters out clicks on the symbol column because it should display asset details
          if ((event?.target as HTMLElement).tagName.toUpperCase() === 'BUTTON')
            return;
          onSelect((data as MarketWithData).id);
        }}
      />
    </AsyncRenderer>
  );
};
