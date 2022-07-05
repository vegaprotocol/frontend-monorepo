import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  VegaOrderTransactionType,
  VegaTransactionDialog,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import { useOrderSubmit } from '../hooks/use-order-submit';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';

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
        orderDialogOpen={orderDialogOpen}
        setOrderDialogOpen={setOrderDialogOpen}
        finalizedOrder={finalizedOrder}
        transaction={transaction}
        reset={reset}
        type={VegaOrderTransactionType.SUBMIT}
      />
    </>
  );
};
