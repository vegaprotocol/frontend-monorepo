import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import type { Orders_party_orders } from '../__generated__/Orders';
import { formatNumber, getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, Button } from '@vegaprotocol/ui-toolkit';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef } from 'react';
import type { OrderCancellationBody } from '@vegaprotocol/vegawallet-service-api-client';
import { useVegaWallet } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';

interface OrderListProps {
  data: Orders_party_orders[] | null;
}

export const CancelRendererButton = (params: ICellRendererParams) => {
  const { sendTx, keypair } = useVegaWallet();
  const cancelOrder = async (data: Orders_party_orders) => {
    if (keypair && data.market) {
      try {
        const command: OrderCancellationBody = {
          pubKey: keypair?.pub,
          propagate: true,
          orderCancellation: {
            orderId: data.id,
            marketId: data.market.id,
          },
        };
        const tx = await sendTx(command);
        console.log(params.data);
        console.log(tx);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  };

  return (
    <Button
      data-testid="cancel"
      onClick={(e) => cancelOrder(params.data as Orders_party_orders)}
    >
      Cancel
    </Button>
  );
};

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
        rowHeight={40}
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
        <AgGridColumn cellRenderer={CancelRendererButton} />
      </AgGrid>
    );
  }
);
