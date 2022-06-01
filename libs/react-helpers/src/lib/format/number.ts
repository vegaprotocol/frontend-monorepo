import { BigNumber } from 'bignumber.js';
import type { BigNumber as EthersBigNumber } from 'ethers';
import memoize from 'lodash/memoize';
import { getUserLocale } from './utils';

export function toDecimal(numberOfDecimals: number) {
  return Math.pow(10, -numberOfDecimals);
}

export function addDecimal(
  value: string | number,
  decimals: number,
  decimalPrecision = decimals
): string {
  if (!decimals) return value.toString();
  return new BigNumber(value || 0)
    .dividedBy(Math.pow(10, decimals))
    .toFixed(decimalPrecision);
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

export const formatNumber = (rawValue: string | number, formatDecimals = 0) => {
  return getNumberFormat(formatDecimals).format(Number(rawValue));
};

export const addDecimalsFormatNumber = (
  rawValue: string | number,
  decimalPlaces: number,
  formatDecimals: number = decimalPlaces
) => {
  const x = addDecimal(rawValue, decimalPlaces);

  return formatNumber(x, formatDecimals);
};

export const formatNumberPercentage = (value: BigNumber, decimals?: number) => {
  const decimalPlaces =
    typeof decimals === 'undefined' ? Math.max(value.dp(), 2) : decimals;
  return `${value.dp(decimalPlaces).toFormat(decimalPlaces)}%`;
};

export const convertEthersBigNum = (
  num: EthersBigNumber,
  decimals: number
): BigNumber => {
  return new BigNumber(addDecimal(num.toString(), decimals));
};
