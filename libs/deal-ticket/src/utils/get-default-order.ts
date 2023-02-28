import { toDecimal } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

export const getDefaultOrder = (market: {
  id: string;
  positionDecimalPlaces: number;
}): OrderSubmissionBody['orderSubmission'] => ({
  marketId: market.id,
  type: Schema.OrderType.TYPE_MARKET,
  side: Schema.Side.SIDE_BUY,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
});

export interface Order {
  marketId: string;
  type: Schema.OrderType;
  size: string;
  side: Schema.Side;
  timeInForce: Schema.OrderTimeInForce;
  price?: string;
  expiresAt?: Date;
}
