import { toDecimal } from '@vegaprotocol/react-helpers';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';

export const getDefaultOrder = (market: {
  id: string;
  positionDecimalPlaces: number;
}): Order => ({
  marketId: market.id,
  type: OrderType.TYPE_MARKET,
  side: Side.SIDE_BUY,
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
});

export interface Order {
  marketId: string;
  type: OrderType;
  size: string;
  side: Side;
  timeInForce: OrderTimeInForce;
  price?: string;
  expiresAt?: Date;
}
