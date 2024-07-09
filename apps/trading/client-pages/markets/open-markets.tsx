import type { MarketMaybeWithData } from '@vegaprotocol/markets';
import type { CellClickedEvent } from 'ag-grid-community';
import MarketListTable from './market-list-table';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { useT } from '../../lib/use-t';
import { type ReactNode } from 'react';

export const OpenMarkets = ({
  data,
  filterSummary,
  error,
}: {
  data: MarketMaybeWithData[] | null;
  filterSummary?: ReactNode;
  error: Error | undefined;
}) => {
  const t = useT();
  const handleOnSelect = useMarketClickHandler();

  return (
    <MarketListTable
      rowData={data}
      filterSummary={filterSummary}
      onCellClicked={({
        data,
        column,
        event,
      }: CellClickedEvent<MarketMaybeWithData>) => {
        if (!data) return;

        // prevent navigating to the market page if any of the below cells are clicked
        // event.preventDefault or event.stopPropagation do not seem to apply for ag-grid
        const colId = column.getColId();

        if (
          [
            'tradableInstrument.instrument.product.settlementAsset.symbol',
            'market-actions',
          ].includes(colId)
        ) {
          return;
        }

        // @ts-ignore metaKey exists
        handleOnSelect(data.id, event ? event.metaKey : false);
      }}
      overlayNoRowsTemplate={error ? error.message : t('No markets')}
      suppressNoRowsOverlay
    />
  );
};
