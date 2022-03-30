import {
  OrderTimeInForce,
  OrderStatus,
  Side,
} from './__generated__/globalTypes';
import { Orders_party_orders } from './__generated__/Orders';
import {
  formatNumber,
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
      overlayNoRowsTemplate="No orders"
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      onGridReady={(params) => {
        gridApi.current = params.api;
      }}
      getRowNodeId={(data) => data.id}
    >
      <AgGridColumn
        headerName="Market"
        field="market.tradableInstrument.instrument.code"
      />
      <AgGridColumn
        headerName="Amount"
        field="size"
        cellClass="font-mono"
        valueFormatter={({ value, data }: ValueFormatterParams) => {
          const prefix = data.side === Side.Buy ? '+' : '-';
          return prefix + value;
        }}
      />
      <AgGridColumn field="type" />
      <AgGridColumn
        field="status"
        valueFormatter={({ value, data }: ValueFormatterParams) => {
          if (value === OrderStatus.Rejected) {
            return `${value}: ${data.rejectionReason}`;
          }

          return value;
        }}
      />
      <AgGridColumn
        headerName="Filled"
        field="remaining"
        cellClass="font-mono"
        valueFormatter={({ data }: ValueFormatterParams) => {
          return `${Number(data.size) - Number(data.remaining)}/${data.size}`;
        }}
      />
      <AgGridColumn
        field="price"
        cellClass="font-mono"
        valueFormatter={({ value, data }: ValueFormatterParams) => {
          if (data.type === 'Market') {
            return '-';
          }
          return formatNumber(value, data.market.decimalPlaces);
        }}
      />
      <AgGridColumn
        field="timeInForce"
        valueFormatter={({ value, data }: ValueFormatterParams) => {
          if (value === OrderTimeInForce.GTT && data.expiresAt) {
            const expiry = getDateTimeFormat().format(new Date(data.expiresAt));
            return `${value}: ${expiry}`;
          }

          return value;
        }}
      />
      <AgGridColumn
        field="createdAt"
        valueFormatter={({ value }: ValueFormatterParams) => {
          return getDateTimeFormat().format(new Date(value));
        }}
      />
    </AgGrid>
  );
};
