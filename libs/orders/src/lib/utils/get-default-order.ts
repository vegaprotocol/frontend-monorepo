import { toDecimal } from '@vegaprotocol/react-helpers';
import type { Order, Market } from '../order-hooks';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';

export const getDefaultOrder = (market: Market): Order => ({
  type: OrderType.TYPE_MARKET,
  side: Side.SIDE_BUY,
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
});
