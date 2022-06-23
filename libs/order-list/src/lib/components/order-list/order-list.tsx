import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import type { Orders_party_orders } from '../__generated__/Orders';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, Button } from '@vegaprotocol/ui-toolkit';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef } from 'react';
import { EthTxStatus } from '@vegaprotocol/web3';
import { TransactionDialog } from '@vegaprotocol/web3';
import { useOrderCancel } from '@vegaprotocol/wallet';

interface OrderListProps {
  data: Orders_party_orders[] | null;
}

export const CancelRendererButton = ({ data }: ICellRendererParams) => {
  const { cancel, transaction } = useOrderCancel({
    orderId: data.id,
    marketId: data.market.id,
  });
  const cancelOrder = async () => {
    const res = await cancel();
    console.log({ transaction });
    if (res) {
      console.log('IMPORTANT', res);

      return (
        <TransactionDialog
          confirmations={1}
          name={'cancel'}
          status={EthTxStatus.Complete}
          error={null}
          txHash={transaction.txHash}
        />
      );
    }
    return (
      <TransactionDialog
        confirmations={1}
        name={'cancel'}
        status={EthTxStatus.Error}
        error={{ name: 'cancel', message: 'cancelling order failed' }}
        txHash={transaction.txHash}
      />
    );
  };

  return (
    <Button data-testid="cancel" onClick={() => cancelOrder()}>
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
            return addDecimalsFormatNumber(value, data.market.decimalPlaces, 3);
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
