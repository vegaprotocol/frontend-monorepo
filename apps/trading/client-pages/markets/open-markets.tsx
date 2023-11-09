import { useDataProvider } from '@vegaprotocol/data-provider';
import type { MarketMaybeWithData } from '@vegaprotocol/markets';
import { marketListProvider } from '@vegaprotocol/markets';
import { useEffect } from 'react';
import type { CellClickedEvent } from 'ag-grid-community';
import MarketListTable from './market-list-table';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { Interval } from '@vegaprotocol/types';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { useT } from '../../lib/use-t';

const POLLING_TIME = 2000;

export const OpenMarkets = () => {
  const t = useT();
  const handleOnSelect = useMarketClickHandler();
  const yesterday = useYesterday();
  const { data, error, reload } = useDataProvider({
    dataProvider: marketListProvider,
    variables: {
      since: new Date(yesterday).toISOString(),
      interval: Interval.INTERVAL_I1H,
    },
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
