import type { Control } from 'react-hook-form';
import type { Market, StaticMarketData } from '@vegaprotocol/markets';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import * as Schema from '@vegaprotocol/types';
import type { OrderFormValues } from '../../hooks/use-form-values';

export interface DealTicketAmountProps {
  control: Control<OrderFormValues>;
  type: Schema.OrderType;
  marketData: StaticMarketData;
  marketPrice?: string;
  market: Market;
  sizeError?: string;
  priceError?: string;
}

export const DealTicketAmount = ({
  type,
  marketData,
  marketPrice,
  ...props
}: DealTicketAmountProps) => {
  switch (type) {
    case Schema.OrderType.TYPE_MARKET:
      return (
        <DealTicketMarketAmount
          {...props}
          marketData={marketData}
          marketPrice={marketPrice}
        />
      );
    case Schema.OrderType.TYPE_LIMIT:
      return <DealTicketLimitAmount {...props} />;
    default: {
      throw new Error('Invalid ticket type ' + type);
    }
  }
};
