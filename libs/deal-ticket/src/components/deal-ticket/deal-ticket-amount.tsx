import type { UseFormRegister } from 'react-hook-form';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import * as Schema from '@vegaprotocol/types';
import type { DealTicketFormFields } from './deal-ticket';

export interface DealTicketAmountProps {
  orderType: Schema.OrderType;
  marketData: MarketData;
  market: Market;
  register: UseFormRegister<DealTicketFormFields>;
  sizeError?: string;
  priceError?: string;
}

export const DealTicketAmount = ({
  orderType,
  marketData,
  ...props
}: DealTicketAmountProps) => {
  switch (orderType) {
    case Schema.OrderType.TYPE_MARKET:
      return <DealTicketMarketAmount {...props} marketData={marketData} />;
    case Schema.OrderType.TYPE_LIMIT:
      return <DealTicketLimitAmount {...props} />;
    default: {
      throw new Error('Invalid ticket type');
    }
  }
};
