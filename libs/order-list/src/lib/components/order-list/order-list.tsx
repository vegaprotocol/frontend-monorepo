import { OrderTimeInForce, OrderStatus, Side } from '@vegaprotocol/types';
import type { Orders_party_orders } from '../__generated__/Orders';
import {
  addDecimal,
  addDecimalsFormatNumber,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import {
  AgGridDynamic as AgGrid,
  Button,
  Dialog,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef, useEffect, useState } from 'react';
import type { Order, VegaTxState } from '@vegaprotocol/wallet';
import {
  useOrderCancel,
  VegaTransactionDialog,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';

interface OrderListProps {
  data: Orders_party_orders[] | null;
}

interface CancelDialogProps {
  orderDialogOpen: boolean;
  setOrderDialogOpen: (isOpen: boolean) => void;
  finalizedOrder: Order | null;
  transaction: VegaTxState;
  reset: () => void;
}

const CancelDialog = ({
  orderDialogOpen,
  setOrderDialogOpen,
  finalizedOrder,
  transaction,
  reset,
}: CancelDialogProps) => {
  useEffect(() => {
    if (transaction.status !== VegaTxStatus.Default) {
      setOrderDialogOpen(true);
    }
  }, [setOrderDialogOpen, transaction.status]);

  const getDialogIntent = (status: VegaTxStatus) => {
    if (finalizedOrder) {
      if (finalizedOrder.status === OrderStatus.Cancelled) {
        return Intent.Success;
      }

      return Intent.Danger;
    }

    if (status === VegaTxStatus.Error) {
      return Intent.Danger;
    }

    return Intent.None;
  };

  return (
    <Dialog
      open={orderDialogOpen}
      onChange={(isOpen) => {
        setOrderDialogOpen(isOpen);

        // If closing reset
        if (!isOpen) {
          reset();
        }
      }}
      intent={getDialogIntent(transaction.status)}
    >
      <VegaTransactionDialog
        transaction={transaction}
        finalizedOrder={finalizedOrder}
        title={'Order cancelled'}
      />
    </Dialog>
  );
};

export const OrderList = forwardRef<AgGridReact, OrderListProps>(
  ({ data }, ref) => {
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const { cancel, transaction, finalizedOrder, reset } = useOrderCancel();

    const CancelRendererButton = ({ data }: ICellRendererParams) => {
      if (
        ![
          OrderStatus.Cancelled,
          OrderStatus.Rejected,
          OrderStatus.Expired,
          OrderStatus.Filled,
          OrderStatus.Stopped,
        ].includes(data.status)
      ) {
        return (
          <Button
            data-testid="cancel"
            onClick={async () => {
              await cancel(data);
            }}
          >
            Cancel
          </Button>
        );
      }
      return null;
    };

    return (
      <>
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
              return addDecimalsFormatNumber(
                value,
                data.market.decimalPlaces,
                3
              );
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
        <CancelDialog
          {...{
            orderDialogOpen,
            setOrderDialogOpen,
            finalizedOrder,
            transaction,
            reset,
          }}
        />
      </>
    );
  }
);
