import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { forwardRef } from 'react';

interface FillsProps {
  data: any;
}

export const Fills = forwardRef<AgGridReact, FillsProps>(({ data }, ref) => {
  return (
    <AgGrid
      ref={ref}
      rowData={data}
      overlayNoRowsTemplate="No fills"
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      getRowId={({ data }) => data.id}
    >
      <AgGridColumn headerName="Market" />
      <AgGridColumn headerName="Order" />
      <AgGridColumn headerName="Filled" />
      <AgGridColumn headerName="Price" />
      <AgGridColumn headerName="Date" />
      <AgGridColumn headerName="Transaction" />
    </AgGrid>
  );
});
