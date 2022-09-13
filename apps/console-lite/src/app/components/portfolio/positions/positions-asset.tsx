import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from '@vegaprotocol/positions';
import { usePositionsData } from '@vegaprotocol/positions';
import { ConsoleLiteGrid } from '../../console-lite-grid';
import useColumnDefinitions from './use-column-definitions';

interface Props {
  partyId: string;
  assetSymbol: string;
}

const getRowId = ({ data }: { data: Position }) => data.marketId;

const PositionsAsset = ({ partyId, assetSymbol }: Props) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, getRows } = usePositionsData({
    partyId,
    assetSymbol,
    gridRef,
  });
  const { columnDefs, defaultColDef } = useColumnDefinitions();
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <ConsoleLiteGrid<Position & { id: undefined }>
        ref={gridRef}
        data={data as (Position & { id: undefined })[]}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
      />
    </AsyncRenderer>
  );
};

export default PositionsAsset;
