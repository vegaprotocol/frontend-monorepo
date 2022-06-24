import type { AgGridReact } from 'ag-grid-react';
import {
  getDateTimeFormat,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import { AgGridColumn } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { forwardRef } from 'react';
import type { FillFields } from './__generated__/FillFields';
import type { ValueFormatterParams } from 'ag-grid-community';

interface FillsProps {
  partyId: string;
  fills: FillFields[];
}

export const Fills = forwardRef<AgGridReact, FillsProps>(
  ({ partyId, fills }, ref) => {
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
        <AgGridColumn headerName="Size" field="size" />
        <AgGridColumn headerName="Price" field="price" />
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
        <AgGridColumn
          headerName="Date"
          field="createdAt"
          valueFormatter={({ value }: ValueFormatterParams) => {
            if (!value) return null;
            return getDateTimeFormat().format(new Date(value));
          }}
        />
      </AgGrid>
    );
  }
);
