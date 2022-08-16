import type { UseFormRegister } from 'react-hook-form';
import { VegaWalletOrderType } from '@vegaprotocol/wallet';
import type { Order } from '@vegaprotocol/orders';
import { DealTicketMarketAmount } from './deal-ticket-market-amount';
import { DealTicketLimitAmount } from './deal-ticket-limit-amount';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';

export interface DealTicketAmountProps {
  orderType: VegaWalletOrderType;
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
    case VegaWalletOrderType.Market:
      return <DealTicketMarketAmount {...props} />;
    case VegaWalletOrderType.Limit:
      return <DealTicketLimitAmount {...props} />;
    default: {
      throw new Error('Invalid ticket type');
    }
  }
};
