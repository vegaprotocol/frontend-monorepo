import { useDataProvider } from '@vegaprotocol/data-provider';
import type { MarketMaybeWithData } from '@vegaprotocol/markets';
import { marketsWithDataProvider } from '@vegaprotocol/markets';
import { useEffect } from 'react';
import { t } from '@vegaprotocol/i18n';
import type { CellClickedEvent } from 'ag-grid-community';
import MarketListTable from './market-list-table';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';

const POLLING_TIME = 2000;

export const OpenMarkets = () => {
  const handleOnSelect = useMarketClickHandler();

  const { data, error, reload } = useDataProvider({
    dataProvider: marketsWithDataProvider,
    variables: undefined,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, POLLING_TIME);
    return () => {
      clearInterval(interval);
    };
  }, [reload]);

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
        // event.preventDefault or event.stopPropagation dont seem to apply for aggird
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
    />
  );
};
