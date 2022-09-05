import { toDecimal } from '@vegaprotocol/react-helpers';
import type { Order } from '../order-hooks';
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
