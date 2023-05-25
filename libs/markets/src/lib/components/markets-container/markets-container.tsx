import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { CellClickedEvent } from 'ag-grid-community';
import { t } from '@vegaprotocol/i18n';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketsWithDataProvider as dataProvider } from '../../markets-provider';
import type { MarketMaybeWithData } from '../../markets-provider';

const POLLING_TIME = 2000;
interface MarketsContainerProps {
  onSelect: (marketId: string, metaKey?: boolean) => void;
}

export const MarketsContainer = ({ onSelect }: MarketsContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<MarketMaybeWithData[] | null>(null);
  const [dataCount, setDataCount] = useState(1);
  const handleDataCount = useCallback(() => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, []);
  const update = useCallback(
    ({ data }: { data: MarketMaybeWithData[] }) => {
      gridRef.current?.api?.setRowData(data);
      dataRef.current = data;
      handleDataCount();
      return true;
    },
    [handleDataCount]
  );

  const { error, loading, reload } = useDataProvider({
    dataProvider,
    variables: undefined,
    update,
    skipUpdates: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, POLLING_TIME);
    return () => {
      clearInterval(interval);
    };
  }, [reload]);

  const handleOnGridReady = useCallback(() => {
    dataRef?.current && update({ data: dataRef.current });
    handleDataCount();
  }, [handleDataCount, update]);

  return (
    <div className="h-full relative">
      <MarketListTable
        ref={gridRef}
        suppressLoadingOverlay
        suppressNoRowsOverlay
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
        onFilterChanged={handleDataCount}
        onGridReady={handleOnGridReady}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={dataRef?.current || []}
          noDataMessage={t('No markets')}
          noDataCondition={() => !dataCount}
          reload={reload}
        />
      </div>
    </div>
  );
};
