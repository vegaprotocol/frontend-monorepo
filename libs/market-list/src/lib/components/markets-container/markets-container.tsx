import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { RowClickedEvent } from 'ag-grid-community';
import { marketsWithDataProvider as dataProvider } from '../../markets-provider';
import type { MarketMaybeWithData } from '../../markets-provider';
interface MarketsContainerProps {
  onSelect: (marketId: string) => void;
}

export const MarketsContainer = ({ onSelect }: MarketsContainerProps) => {
  const { data, error, loading, reload } = useDataProvider({
    dataProvider,
    skipUpdates: true,
    variables: undefined,
  });

  return (
    <div className="h-full relative">
      <MarketListTable
        rowData={error ? [] : data}
        noRowsOverlayComponent={() => null}
        onRowClicked={(rowEvent: RowClickedEvent) => {
          const { data, event } = rowEvent;
          // filters out clicks on the symbol column because it should display asset details
          if (
            (event?.target as HTMLElement).tagName.toUpperCase() === 'BUTTON'
          ) {
            return;
          }
          onSelect((data as MarketMaybeWithData).id);
        }}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No markets')}
          reload={reload}
        />
      </div>
    </div>
  );
};
