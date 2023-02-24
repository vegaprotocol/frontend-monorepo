import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { FillsTable } from './fills-table';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import { useFillsList } from './use-fills-list';

interface FillsManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string) => void;
}

export const FillsManager = ({
  partyId,
  marketId,
  onMarketClick,
}: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const { data, error, loading, addNewRows, getRows, reload } = useFillsList({
    partyId,
    marketId,
    gridRef,
    scrolledToTop,
  });

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  return (
    <div className="h-full relative">
      <FillsTable
        ref={gridRef}
        partyId={partyId}
        rowModelType="infinite"
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        onMarketClick={onMarketClick}
        suppressLoadingOverlay
        suppressNoRowsOverlay
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No fills')}
          noDataCondition={(data) => !(data && data.length)}
          reload={reload}
        />
      </div>
    </div>
  );
};
