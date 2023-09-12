import type { MouseEvent } from 'react';
import React, { useEffect } from 'react';
import type { CellClickedEvent } from 'ag-grid-community';
import { t } from '@vegaprotocol/i18n';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketListProvider as dataProvider } from '../../markets-provider';
import type { MarketMaybeWithData } from '../../markets-provider';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';

const POLLING_TIME = 2000;
interface MarketsContainerProps {
  onSelect: (marketId: string, metaKey?: boolean) => void;
  SuccessorMarketRenderer?: React.FC<{ value: string }>;
}

export const MarketsContainer = ({
  onSelect,
  SuccessorMarketRenderer,
}: MarketsContainerProps) => {
  const yesterday = useYesterday();
  const { data, error, reload } = useDataProvider({
    dataProvider,
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
    <div className="h-full relative">
      <MarketListTable
        rowData={data}
        onCellClicked={(cellEvent: CellClickedEvent) => {
          const { data, column, event } = cellEvent;
          // prevent navigating to the market page if any of the below cells are clicked
          // event.preventDefault or event.stopPropagation dont seem to apply for aggird
          const colId = column.getColId();
          if (
            [
              'id',
              'tradableInstrument.instrument.code',
              'tradableInstrument.instrument.product.settlementAsset',
              'tradableInstrument.instrument.product.settlementAsset.symbol',
              'market-actions',
            ].includes(colId)
          ) {
            return;
          }
          onSelect(
            (data as MarketMaybeWithData).id,
            (event as unknown as MouseEvent)?.metaKey ||
              (event as unknown as MouseEvent)?.ctrlKey
          );
        }}
        onMarketClick={onSelect}
        overlayNoRowsTemplate={error ? error.message : t('No markets')}
        SuccessorMarketRenderer={SuccessorMarketRenderer}
      />
    </div>
  );
};
