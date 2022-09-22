import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { TradeWithMarket } from '@vegaprotocol/fills';
import { useFillsList } from '@vegaprotocol/fills';
import type { BodyScrollEndEvent, BodyScrollEvent } from 'ag-grid-community';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import useColumnDefinitions from './use-column-definitions';

interface Props {
  partyId: string;
}

const FillsManager = ({ partyId }: Props) => {
  const { columnDefs, defaultColDef } = useColumnDefinitions({ partyId });
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
      <ConsoleLiteGrid<TradeWithMarket>
        ref={gridRef}
        rowModelType="infinite"
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      />
    </AsyncRenderer>
  );
};

export default FillsManager;
