import type { ReactNode } from 'react';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import {
  useOrderSubmit,
  OrderFeedback,
  getOrderDialogTitle,
  getOrderDialogIntent,
  getOrderDialogIcon,
} from '@vegaprotocol/orders';

export interface DealTicketManagerProps {
  market: DealTicketQuery_market;
  children?: ReactNode | ReactNode[];
}

export const DealTicketManager = ({
  market,
  children,
}: DealTicketManagerProps) => {
  const { submit, transaction, finalizedOrder, TransactionDialog } =
    useOrderSubmit();

  return (
    <>
      {children || (
        <DealTicket
          market={market}
          submit={(order) => submit(order)}
          transactionStatus={
            transaction.status === VegaTxStatus.Requested ||
            transaction.status === VegaTxStatus.Pending
              ? 'pending'
              : 'default'
          }
        />
      )}
      <TransactionDialog
        title={getOrderDialogTitle(finalizedOrder?.status)}
        intent={getOrderDialogIntent(finalizedOrder?.status)}
        icon={getOrderDialogIcon(finalizedOrder?.status)}
      >
        <OrderFeedback transaction={transaction} order={finalizedOrder} />
      </TransactionDialog>
    </>
  );
};
