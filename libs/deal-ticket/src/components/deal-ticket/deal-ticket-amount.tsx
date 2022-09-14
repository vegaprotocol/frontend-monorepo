import type { UseFormRegister } from 'react-hook-form';
import type { Order } from '@vegaprotocol/orders';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import type { DealTicketFieldsFragment } from '../__generated__/DealTicket';
import { OrderType } from '@vegaprotocol/types';

export interface DealTicketAmountProps {
  orderType: OrderType;
  market: DealTicketFieldsFragment;
  register: UseFormRegister<Order>;
  quoteName: string;
  price?: string;
}

export const DealTicketAmount = ({
  orderType,
  ...props
}: DealTicketAmountProps) => {
  switch (orderType) {
    case OrderType.TYPE_MARKET:
      return <DealTicketMarketAmount {...props} />;
    case OrderType.TYPE_LIMIT:
      return <DealTicketLimitAmount {...props} />;
    default: {
      throw new Error('Invalid ticket type');
    }
  }
};
