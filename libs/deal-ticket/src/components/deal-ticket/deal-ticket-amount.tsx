import type { Control } from 'react-hook-form';
import type { Market, MarketData } from '@vegaprotocol/markets';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import * as Schema from '@vegaprotocol/types';
import type { OrderObj } from '@vegaprotocol/orders';
import type { OrderFormFields } from '../../hooks/use-order-form';

export interface DealTicketAmountProps {
  control: Control<OrderFormFields>;
  orderType: Schema.OrderType;
  marketData: MarketData;
  market: Market;
  sizeError?: string;
  priceError?: string;
  update: (obj: Partial<OrderObj>) => void;
  size: string;
  price?: string;
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
