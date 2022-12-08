import type { UseFormRegister } from 'react-hook-form';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import * as Schema from '@vegaprotocol/types';
import type { DealTicketFormFields } from './deal-ticket';

export interface DealTicketAmountProps {
  orderType: Schema.OrderType;
  market: MarketDealTicket;
  register: UseFormRegister<DealTicketFormFields>;
  sizeError?: string;
  priceError?: string;
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
