import type { ReactNode } from 'react';
import { useState } from 'react';
import { VegaTransactionDialog, VegaTxStatus } from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { useOrderSubmit } from '@vegaprotocol/orders';
import { OrderStatus } from '@vegaprotocol/types';

export interface DealTicketManagerProps {
  market: DealTicketQuery_market;
  children?: ReactNode | ReactNode[];
}

export const DealTicketManager = ({
  market,
  children,
}: DealTicketManagerProps) => {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const { submit, transaction, finalizedOrder, reset } = useOrderSubmit(market);
  const getDialogTitle = (status?: string) => {
    switch (status) {
      case OrderStatus.Active:
        return 'Order submitted';
      case OrderStatus.Filled:
        return 'Order filled';
      case OrderStatus.PartiallyFilled:
        return 'Order partially filled';
      case OrderStatus.Parked:
        return 'Order parked';
      default:
        return 'Submission failed';
    }
  };
  return (
    <>
      {children || (
        <DealTicket
          market={market}
          submit={submit}
          transactionStatus={
            transaction.status === VegaTxStatus.Requested ||
            transaction.status === VegaTxStatus.Pending
              ? 'pending'
              : 'default'
          }
        />
      )}
      <VegaTransactionDialog
        key={`submit-order-dialog-${transaction.txHash}`}
        orderDialogOpen={orderDialogOpen}
        setOrderDialogOpen={setOrderDialogOpen}
        finalizedOrder={finalizedOrder}
        transaction={transaction}
        reset={reset}
        title={getDialogTitle(finalizedOrder?.status)}
      />
    </>
  );
};
