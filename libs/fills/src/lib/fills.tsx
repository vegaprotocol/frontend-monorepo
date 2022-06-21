import type { AgGridReact } from 'ag-grid-react';
import { truncateByChars } from '@vegaprotocol/react-helpers';
import { AgGridColumn } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { forwardRef } from 'react';
import type { FillFields } from './__generated__/FillFields';

interface FillsProps {
  fills: FillFields[];
  partyId: string;
}

export const Fills = forwardRef<AgGridReact, FillsProps>(
  ({ fills, partyId }, ref) => {
    return (
      <AgGrid
        ref={ref}
        rowData={fills}
        overlayNoRowsTemplate="No fills"
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data.id}
      >
        <AgGridColumn
          headerName="Market"
          field="market.tradableInstrument.instrument.code"
        />
        {/* TODO: link to block explorer */}
        <AgGridColumn
          headerName="Order"
          valueFormatter={({ data }: { data: FillFields }) => {
            if (data.buyer.id === partyId) {
              // you are the buyer
              return truncateByChars(data.buyOrder);
            } else if (data.seller.id) {
              // you are the seller
              return truncateByChars(data.sellOrder);
            } else {
              return '-';
            }
          }}
        />
        <AgGridColumn headerName="Size" field="size" />
        <AgGridColumn headerName="Price" field="price" />
        <AgGridColumn headerName="Date" field="createdAt" />
      </AgGrid>
    );
  }
);
