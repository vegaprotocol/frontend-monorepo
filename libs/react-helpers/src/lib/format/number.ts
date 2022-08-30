import { BigNumber } from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import memoize from 'lodash/memoize';
import React from 'react';
import { getUserLocale } from './utils';

export function toDecimal(numberOfDecimals: number) {
  return 1 / Math.pow(10, numberOfDecimals);
}

export function toBigNum(
  rawValue: string | number | EthersBigNumber,
  decimals: number
): BigNumber {
  return new BigNumber(
    rawValue instanceof EthersBigNumber ? rawValue.toString() : rawValue || 0
  ).dividedBy(Math.pow(10, decimals));
}

export function addDecimal(
  value: string | number | EthersBigNumber,
  decimals?: number,
  decimalPrecision = decimals
): string {
  if (!decimals) return value.toString();
  return toBigNum(value, decimals).toFixed(decimalPrecision ?? 0);
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

export const getDecimalSeparator = memoize(
  () =>
    getNumberFormat(1)
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')?.value
);

export const formatNumber = (
  rawValue: string | number | BigNumber,
  formatDecimals = 0
) => {
  return getNumberFormat(formatDecimals).format(Number(rawValue));
};

export const addDecimalsFormatNumber = (
  rawValue?: string | number | null,
  decimalPlaces = 0,
  formatDecimals: number = decimalPlaces
) => {
  if (!rawValue) return '-';
  const x = addDecimal(rawValue, decimalPlaces);

  return formatNumber(x, formatDecimals);
};

export const formatNumberPercentage = (
  value: BigNumber | string | number,
  decimals?: number
) => {
  const decimalPlaces =
    typeof decimals === 'undefined'
      ? Math.max(new BigNumber(value).dp(), 2)
      : decimals;
  return `${formatNumber(new BigNumber(value), decimalPlaces)}%`;
};

export const toNumberParts = (
  value: BigNumber | null | undefined,
  decimals = 18
): [integers: string, decimalPlaces: string] => {
  if (!value) {
    return ['0', '0'.repeat(decimals)];
  }
  const separator = getDecimalSeparator() || '.';
  const [integers, decimalsPlaces] = formatNumber(value, decimals)
    .toString()
    .split(separator);
  return [integers, decimalsPlaces || ''];
};

export const useNumberParts = (
  value: BigNumber | null | undefined,
  decimals: number
): [integers: string, decimalPlaces: string] => {
  return React.useMemo(() => toNumberParts(value, decimals), [decimals, value]);
};
