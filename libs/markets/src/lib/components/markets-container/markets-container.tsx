import type { MouseEvent } from 'react';
import React, { useEffect, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { CellClickedEvent } from 'ag-grid-community';
import { t } from '@vegaprotocol/i18n';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketsWithDataProvider as dataProvider } from '../../markets-provider';
import type { MarketMaybeWithData } from '../../markets-provider';

const POLLING_TIME = 2000;
interface MarketsContainerProps {
  onSelect: (marketId: string, metaKey?: boolean) => void;
  SuccessorMarketRenderer?: React.FC<{ value: string }>;
}

export const MarketsContainer = ({
  onSelect,
  SuccessorMarketRenderer,
}: MarketsContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);

  const { data, error, reload } = useDataProvider({
    dataProvider,
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
    <div className="h-full relative">
      <MarketListTable
        ref={gridRef}
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
