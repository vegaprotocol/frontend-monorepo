import {
  OrderTimeInForce,
  OrderType,
  Side as OrderSide,
} from '@vegaprotocol/types';
import { toDecimal } from '@vegaprotocol/react-helpers';
import type { Order, Market } from '../order-hooks';

export const getDefaultOrder = (market: Market): Order => ({
  type: OrderType.TYPE_MARKET,
  side: OrderSide.SIDE_BUY,
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
});
