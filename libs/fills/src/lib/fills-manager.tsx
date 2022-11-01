import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';

import { FillsTable } from './fills-table';
import { useFillsList } from './use-fills-list';

import type { AgGridReact } from 'ag-grid-react';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
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
    <AsyncRenderer loading={loading} error={error} data={data || []}>
      <FillsTable
        ref={gridRef}
        partyId={partyId}
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
