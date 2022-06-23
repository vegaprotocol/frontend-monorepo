import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import type { Orders_party_orders } from './__generated__/Orders';
import {
  addDecimal,
  formatNumber,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { ValueFormatterParams } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef } from 'react';
import BigNumber from 'bignumber.js';

interface OrderListProps {
  data: Orders_party_orders[] | null;
}

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  ({ data }, ref) => {
    return (
      <AgGrid
        ref={ref}
        rowData={data}
        overlayNoRowsTemplate="No orders"
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data.id}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.code"
        />
        <AgGridColumn
          headerName={t('Amount')}
          field="size"
          cellClass="font-mono"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            const prefix = data.side === Side.Buy ? '+' : '-';
            return (
              prefix + addDecimal(value, data.market.positionDecimalPlaces)
            );
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
          headerName={t('Filled')}
          field="remaining"
          cellClass="font-mono"
          valueFormatter={({ data }: ValueFormatterParams) => {
            const dps = data.market.positionDecimalPlaces;
            const size = new BigNumber(data.size);
            const remaining = new BigNumber(data.remaining);
            const fills = size.minus(remaining);
            return `${addDecimal(fills.toString(), dps)}/${addDecimal(
              size.toString(),
              dps
            )}`;
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
              const expiry = getDateTimeFormat().format(
                new Date(data.expiresAt)
              );
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
        <AgGridColumn
          field="updatedAt"
          valueFormatter={({ value }: ValueFormatterParams) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '-';
          }}
        />
      </AgGrid>
    );
  }
);
