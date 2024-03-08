import type { Market } from '@vegaprotocol/types';
import { toBigNum, toDecimal } from './format';

export const determinePriceStep = (
  market: Pick<Market, 'decimalPlaces' | 'tickSize'>
) => {
  let priceStep = toDecimal(market.decimalPlaces);

  const scaledTickSize = toBigNum(market.tickSize, market.decimalPlaces);
  if (scaledTickSize.isGreaterThan(0)) {
    priceStep = scaledTickSize.toString();
  }

  return priceStep;
};

export const determineSizeStep = (
  market: Pick<Market, 'positionDecimalPlaces'>
) => {
  return toDecimal(market.positionDecimalPlaces);
};
