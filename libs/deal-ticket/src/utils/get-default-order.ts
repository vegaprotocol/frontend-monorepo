import { OrderTimeInForce, OrderType, OrderSide } from '@vegaprotocol/wallet';
import { toDecimal } from '@vegaprotocol/react-helpers';
import type { DealTicketQuery_market } from '../components/__generated__/DealTicketQuery';

export type Order =
  | {
      size: string;
      type: OrderType.Market;
      timeInForce: OrderTimeInForce;
      side: OrderSide;
      price?: never;
      expiration?: never;
    }
  | {
      size: string;
      type: OrderType.Limit;
      timeInForce: OrderTimeInForce;
      side: OrderSide;
      price?: string;
      expiration?: Date;
    };

export const getDefaultOrder = (market: DealTicketQuery_market): Order => ({
  type: OrderType.Market,
  side: OrderSide.Buy,
  timeInForce: OrderTimeInForce.IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
});
