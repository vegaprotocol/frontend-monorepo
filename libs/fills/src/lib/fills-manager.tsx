import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { FillsTable } from './fills-table';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import { useFillsList } from './use-fills-list';

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const { data, error, loading, addNewRows, getRows } = useFillsList({
    partyId,
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
    <AsyncRenderer loading={loading} error={error} data={data}>
      <FillsTable
        ref={gridRef}
        partyId={partyId}
        datasource={{ getRows }}
        rowModelType="infinite"
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
