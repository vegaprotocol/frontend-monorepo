import type { UseFormRegister } from 'react-hook-form';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import type { DealTicketMarketFragment } from './__generated__/DealTicket';
import { Schema } from '@vegaprotocol/types';

export interface DealTicketAmountProps {
  orderType: Schema.OrderType;
  market: DealTicketMarketFragment;
  register: UseFormRegister<OrderSubmissionBody['orderSubmission']>;
  quoteName: string;
  price?: string;
}

export const DealTicketAmount = ({
  orderType,
  ...props
}: DealTicketAmountProps) => {
  switch (orderType) {
    case Schema.OrderType.TYPE_MARKET:
      return <DealTicketMarketAmount {...props} />;
    case Schema.OrderType.TYPE_LIMIT:
      return <DealTicketLimitAmount {...props} />;
    default: {
      throw new Error('Invalid ticket type');
    }
  }
};
