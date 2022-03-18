import { Orders_party_orders } from '@vegaprotocol/graphql';
import {
  getDateTimeFormat,
  useApplyGridTransaction,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { GridApi, ValueFormatterParams } from 'ag-grid-community';
import { AgGridColumn } from 'ag-grid-react';
import { useRef, useState } from 'react';

interface OrderListProps {
  orders: Orders_party_orders[];
}

export const OrderList = ({ orders }: OrderListProps) => {
  // Store initial orders for initial table data set, further updates
  // are handled by the effect below
  const [initialOrders] = useState(orders);
  const gridApi = useRef<GridApi | null>(null);
  useApplyGridTransaction<Orders_party_orders>(orders, gridApi.current);

  return (
    <AgGrid
      rowData={initialOrders}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      onGridReady={(params) => {
        gridApi.current = params.api;
      }}
      getRowNodeId={(data) => data.id}
    >
      <AgGridColumn field="market.tradableInstrument.instrument.code" />
      <AgGridColumn
        field="size"
        valueFormatter={(params: ValueFormatterParams) => {
          let prefix = '';
          if (params.data.side === 'Buy') {
            prefix = '+';
          } else if (params.data.side === 'Sell') {
            prefix = '-';
          }
          return prefix + params.value;
        }}
      />
      <AgGridColumn field="type" />
      <AgGridColumn field="status" />
      <AgGridColumn
        field="remaining"
        valueFormatter={(params: ValueFormatterParams) => {
          return `${Number(params.data.size) - Number(params.data.remaining)}/${
            params.data.size
          }`;
        }}
      />
      <AgGridColumn
        field="price"
        valueFormatter={(params: ValueFormatterParams) => {
          if (params.data.type === 'Market') {
            return '-';
          }
          return params.value;
        }}
      />
      <AgGridColumn field="timeInForce" />
      <AgGridColumn
        field="createdAt"
        valueFormatter={({ value }: ValueFormatterParams) => {
          return getDateTimeFormat().format(new Date(value));
        }}
      />
    </AgGrid>
  );
};
