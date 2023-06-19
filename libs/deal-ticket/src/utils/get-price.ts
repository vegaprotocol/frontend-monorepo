import { isMarketInAuction } from './is-market-in-auction';
import type { MarketData } from '@vegaprotocol/markets';
import { vega as vegaProtos } from '@vegaprotocol/protos';
import type { Type as OrderType } from '@vegaprotocol/protos/dist/vega/Order';
/**
 * Get the market price based on market mode (auction or not auction)
 */
export const getMarketPrice = (marketData: MarketData) => {
  const { marketTradingMode, indicativePrice, markPrice } = marketData;
  if (isMarketInAuction(marketTradingMode)) {
    // 0 can never be a valid uncrossing price
    // as it would require there being orders on the book at that price.
    if (
      indicativePrice &&
      indicativePrice !== '0' &&
      BigInt(indicativePrice) !== BigInt(0)
    ) {
      return indicativePrice;
    }
  } else {
    return markPrice;
  }
  return undefined;
};

/**
 * Gets the price for an order, order limit this is the user
 * entered value, for market this will be the mark price or
 * if in auction the indicative uncrossing price
 */
export const getDerivedPrice = (
  order: {
    type: OrderType.Type;
    price?: string | undefined;
  },
  marketData: MarketData
) => {
  // If order type is market we should use either the mark price
  // or the uncrossing price. If order type is limit use the price
  // the user has input

  // Use the market price if order is a market order
  let price;
  if (order.type === vegaProtos.Order.Type.TYPE_LIMIT && order.price) {
    price = order.price;
  } else {
    price = getMarketPrice(marketData);
  }

  return price === '0' ? undefined : price;
};
