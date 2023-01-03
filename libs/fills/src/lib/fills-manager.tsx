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
}

export const FillsManager = ({ partyId, marketId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const { data, error, loading, addNewRows, getRows } = useFillsList({
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
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        noRowsOverlayComponent={() => null}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No fills')}
          noDataCondition={(data) => !(data && data.length)}
        />
      </div>
    </div>
  );
};
