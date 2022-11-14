import {
  AgGridDynamic as AgGrid,
  AsyncRenderer,
} from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { proposalsListDataProvider } from '../proposals-data-provider';
import { useCallback, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useColumnDefs } from './use-column-defs';

export const ProposalsList = () => {
  const { data, loading, error } = useDataProvider({
    dataProvider: proposalsListDataProvider,
  });
  const gridRef = useRef<AgGridReact | null>(null);
  const handleOnGridReady = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);

  const { columnDefs, defaultColDef } = useColumnDefs();
  const handleRowClicked = useCallback(() => {
    console.log('soon');
  }, []);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <AgGrid
        ref={gridRef}
        domLayout="autoHeight"
        className="min-w-full"
        columnDefs={columnDefs}
        rowData={data}
        defaultColDef={defaultColDef}
        onRowClicked={handleRowClicked}
        onGridReady={handleOnGridReady}
        overlayNoRowsTemplate="No data"
      />
    </AsyncRenderer>
  );
};
