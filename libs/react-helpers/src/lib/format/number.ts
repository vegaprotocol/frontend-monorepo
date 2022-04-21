import { BigNumber } from 'bignumber.js';
import memoize from 'lodash/memoize';
import { getUserLocale } from './utils';

export function addDecimal(
  value: string,
  decimals: number,
  decimalPrecision?: number
): string {
  if (!decimals) return value;
  return new BigNumber(value || 0)
    .dividedBy(Math.pow(10, decimals))
    .toFixed(decimalPrecision || decimals);
}

export function removeDecimal(value: string, decimals: number): string {
  if (!decimals) return value;
  return new BigNumber(value || 0).times(Math.pow(10, decimals)).toFixed(0);
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export const getNumberFormat = memoize(
  (digits: number) =>
    new Intl.NumberFormat(getUserLocale(), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
);

export const formatNumber = (
  rawValue: string,
  decimalPlaces: number,
  formatDecimals: number = decimalPlaces
) => {
  const x = addDecimal(rawValue, decimalPlaces);

  return getNumberFormat(formatDecimals).format(Number(x));
};
