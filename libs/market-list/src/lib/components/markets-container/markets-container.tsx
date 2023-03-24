import { t } from '@vegaprotocol/i18n';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { CellClickedEvent } from 'ag-grid-community';
import { marketsWithDataProvider as dataProvider } from '../../markets-provider';
import type { MarketMaybeWithData } from '../../markets-provider';
import type { VegaICellRendererParams } from '@vegaprotocol/datagrid';

export interface MarketNameCellPropsRenderer {
  MarketNameCell?: ({
    value,
    data,
  }: VegaICellRendererParams<
    MarketMaybeWithData,
    'tradableInstrument.instrument.code'
  >) => JSX.Element | null;
}

interface MarketsContainerProps extends MarketNameCellPropsRenderer {
  onSelect: (marketId: string) => void;
}

export const MarketsContainer = ({
  onSelect,
  MarketNameCell,
}: MarketsContainerProps) => {
  const { data, error, loading, reload } = useDataProvider({
    dataProvider,
    skipUpdates: true,
    variables: undefined,
  });
  return (
    <div className="h-full relative">
      <MarketListTable
        rowData={error ? [] : data}
        suppressLoadingOverlay
        suppressNoRowsOverlay
        onCellClicked={(cellEvent: CellClickedEvent) => {
          const { data, column } = cellEvent;
          const colId = column.getColId();
          if (
            [
              'tradableInstrument.instrument.code',
              'tradableInstrument.instrument.product.settlementAsset',
            ].includes(colId)
          ) {
            return;
          }
          onSelect((data as MarketMaybeWithData).id);
        }}
        MarketNameCell={MarketNameCell}
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
