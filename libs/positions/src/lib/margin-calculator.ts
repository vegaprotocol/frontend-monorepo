import { toBigNum } from '@vegaprotocol/utils';
import { Side, MarketTradingMode, OrderType } from '@vegaprotocol/types';
import type { ScalingFactors, RiskFactor } from '@vegaprotocol/types';
import type { MarketData } from '@vegaprotocol/market-list';

export const isMarketInAuction = (marketTradingMode: MarketTradingMode) => {
  return [
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(marketTradingMode);
};

/**
 * Get the market price based on market mode (auction or not auction)
 */
export const getMarketPrice = ({
  marketTradingMode,
  indicativePrice,
  markPrice,
}: Pick<MarketData, 'marketTradingMode' | 'indicativePrice' | 'markPrice'>) => {
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
  }
  return markPrice;
};

/**
 * Gets the price for an order, order limit this is the user
 * entered value, for market this will be the mark price or
 * if in auction the indicative uncrossing price
 */
export const getDerivedPrice = (
  order: {
    type?: OrderType | null;
    price?: string;
  },
  marketData: Pick<
    MarketData,
    'marketTradingMode' | 'indicativePrice' | 'markPrice'
  >
) => {
  // If order type is market we should use either the mark price
  // or the uncrossing price. If order type is limit use the price
  // the user has input

  // Use the market price if order is a market order
  if (order.type === OrderType.TYPE_LIMIT && order.price) {
    return order.price;
  }
  return getMarketPrice(marketData);
};

export const calculateMargins = ({
  size,
  side,
  price,
  decimals,
  positionDecimalPlaces,
  decimalPlaces,
  scalingFactors,
  riskFactors,
}: {
  size: string;
  side: Side;
  positionDecimalPlaces: number;
  decimalPlaces: number;
  decimals: number;
  price: string;
  scalingFactors?: ScalingFactors;
  riskFactors: RiskFactor;
}) => {
  const maintenanceMargin = toBigNum(size, positionDecimalPlaces)
    .multipliedBy(
      side === Side.SIDE_SELL ? riskFactors.short : riskFactors.long
    )
    .multipliedBy(toBigNum(price, decimalPlaces));
  return {
    maintenanceMargin: maintenanceMargin
      .multipliedBy(Math.pow(10, decimals))
      .toFixed(0),
    initialMargin: maintenanceMargin
      .multipliedBy(scalingFactors?.initialMargin ?? 1)
      .multipliedBy(Math.pow(10, decimals))
      .toFixed(0),
  };
};
