import type { Market } from '@vegaprotocol/types';
import { toBigNum, toDecimal } from './format';
import type BigNumber from 'bignumber.js';

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

export const roundUpToTickSize = (
  price: BigNumber,
  tickSize: string,
  isBid?: boolean
): BigNumber => {
  if (!tickSize || tickSize === '0') {
    return price;
  }

  const remainder = price.modulo(tickSize);

  if (remainder.isZero()) {
    return price;
  }

  if (isBid) {
    return price.minus(remainder);
  } else {
    return price.plus(tickSize).minus(remainder);
  }
};
