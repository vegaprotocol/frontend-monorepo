import { toDecimal } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

export const toPercentOf = (pct: number, value: BigNumber) => {
  return BigNumber(pct).div(100).times(value);
};

export const toNotional = (size: BigNumber, price: BigNumber) => {
  return size.times(price);
};

export const toSize = (notional: BigNumber, price: BigNumber) => {
  return notional.div(price);
};

export const roundToPositionDecimals = (size: BigNumber, decimals: number) => {
  return size.minus(size.mod(toDecimal(decimals)));
};
