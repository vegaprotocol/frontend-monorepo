import type { AgGridReact } from 'ag-grid-react';
import {
  getDateTimeFormat,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import { AgGridColumn } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { forwardRef } from 'react';
import type { FillFields } from './__generated__/FillFields';
import type {
  GridApi,
  IDatasource,
  ValueFormatterParams,
} from 'ag-grid-community';

interface FillsProps {
  datasource: IDatasource;
  partyId: string;
  onBodyScrollEnd: (params: { api: GridApi; top: number }) => void;
}

export const Fills = forwardRef<AgGridReact, FillsProps>(
  ({ partyId, datasource, onBodyScrollEnd }, ref) => {
    return (
      <AgGrid
        ref={ref}
        overlayNoRowsTemplate="No fills"
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data.id}
        onBodyScrollEnd={onBodyScrollEnd}
        rowModelType="infinite"
        datasource={datasource}
      >
        <AgGridColumn
          headerName="Id"
          field="id"
          valueFormatter={({ value }: ValueFormatterParams) => {
            if (!value) return null;
            return truncateByChars(value);
          }}
        />
        <AgGridColumn
          headerName="Market"
          field="market.tradableInstrument.instrument.code"
        />
        {/* TODO: link to block explorer */}
        <AgGridColumn
          headerName="Order"
          valueFormatter={({ data }: { data: FillFields }) => {
            if (!data) return null;
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
