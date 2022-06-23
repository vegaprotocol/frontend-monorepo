import type { UseFormRegister } from 'react-hook-form';
import { OrderType } from '@vegaprotocol/wallet';
import type { Order } from '../utils/get-default-order';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';

export interface DealTicketAmountProps {
  orderType: OrderType;
  step: number;
  register: UseFormRegister<Order>;
  quoteName: string;
  price?: string;
}

export const DealTicketAmount = ({
  orderType,
  ...props
}: DealTicketAmountProps) => {
  switch (orderType) {
    case OrderType.Market:
      return <DealTicketMarketAmount {...props} />;
    case OrderType.Limit:
      return <DealTicketLimitAmount {...props} />;
    default: {
      throw new Error('Invalid ticket type');
    }
  }
};
