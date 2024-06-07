import type { MarketMaybeWithData } from '@vegaprotocol/markets';
import type { CellClickedEvent } from 'ag-grid-community';
import MarketListTable from './market-list-table';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { useActiveMarkets } from '../../lib/hooks/use-markets';

export const OpenMarkets = () => {
  const { data } = useActiveMarkets();
  const handleOnSelect = useMarketClickHandler();

  return (
    <MarketListTable
      rowData={data}
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
    />
  );
};
