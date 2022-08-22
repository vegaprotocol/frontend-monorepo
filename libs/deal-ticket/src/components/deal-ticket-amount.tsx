import type { UseFormRegister } from 'react-hook-form';
import { OrderType } from '@vegaprotocol/types';
import type { Order } from '@vegaprotocol/orders';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';

export interface DealTicketAmountProps {
  orderType: OrderType;
  market: DealTicketQuery_market;
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
