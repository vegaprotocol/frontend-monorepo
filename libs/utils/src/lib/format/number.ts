import { BigNumber } from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import isNil from 'lodash/isNil';
import memoize from 'lodash/memoize';

import { getUserLocale } from '../get-user-locale';

const MIN_FRACTION_DIGITS = 2;
const MAX_FRACTION_DIGITS = 20;

export function toDecimal(numberOfDecimals: number) {
  return new BigNumber(1)
    .dividedBy(Math.pow(10, numberOfDecimals))
    .toString(10);
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
  decimals: number,
  decimalPrecision = decimals
): string {
  if (!decimals) return value.toString();
  if (!decimalPrecision || decimalPrecision < 0) {
    return toBigNum(value, decimals).toFixed(0);
  }
  return toBigNum(value, decimals).toFixed(decimalPrecision);
}

export function removeDecimal(value: string, decimals: number): string {
  if (!decimals) return value;
  return new BigNumber(value || 0).times(Math.pow(10, decimals)).toFixed(0);
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export const getNumberFormat = memoize((digits: number) => {
  if (isNil(digits) || digits < 0) {
    return new Intl.NumberFormat(getUserLocale());
  }
  return new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: Math.min(Math.max(0, digits), MIN_FRACTION_DIGITS),
    maximumFractionDigits: Math.min(Math.max(0, digits), MAX_FRACTION_DIGITS),
  });
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export const getFixedNumberFormat = memoize((digits: number) => {
  if (isNil(digits) || digits < 0) {
    return new Intl.NumberFormat(getUserLocale());
  }
  return new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: Math.min(Math.max(0, digits), MAX_FRACTION_DIGITS),
    maximumFractionDigits: Math.min(Math.max(0, digits), MAX_FRACTION_DIGITS),
  });
});

export const getDecimalSeparator = memoize(
  () =>
    getNumberFormat(1)
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')?.value
);

/** formatNumber will format the number with fixed decimals
 * @param rawValue - should be a number that is not outside the safe range fail as in https://mikemcl.github.io/bignumber.js/#toN
 * @param formatDecimals - number of decimals to use
 */
export const formatNumber = (
  rawValue: string | number | BigNumber,
  formatDecimals = 0
) => {
  return getNumberFormat(formatDecimals).format(Number(rawValue));
};

/** formatNumberFixed will format the number with fixed decimals
 * @param rawValue - should be a number that is not outside the safe range fail as in https://mikemcl.github.io/bignumber.js/#toN
 * @param formatDecimals - number of decimals to use
 */
export const formatNumberFixed = (
  rawValue: string | number | BigNumber,
  formatDecimals = 0
) => {
  return getFixedNumberFormat(formatDecimals).format(Number(rawValue));
};

export const addDecimalsFormatNumber = (
  rawValue: string | number,
  decimalPlaces: number,
  formatDecimals: number = decimalPlaces
) => {
  const x = addDecimal(rawValue, decimalPlaces);

  return formatNumber(x, formatDecimals);
};

export const addDecimalsFixedFormatNumber = (
  rawValue: string | number,
  decimalPlaces: number,
  formatDecimals: number = decimalPlaces
) => {
  const x = addDecimal(rawValue, decimalPlaces);

  return formatNumberFixed(x, formatDecimals);
};

export const formatNumberPercentage = (value: BigNumber, decimals?: number) => {
  const decimalPlaces =
    typeof decimals === 'undefined' ? Math.max(value.dp() || 0, 2) : decimals;
  return `${formatNumber(value, decimalPlaces)}%`;
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

export const isNumeric = (
  value?: string | number | BigNumber | bigint | null
): value is NonNullable<number | string> => /^-?\d*\.?\d+$/.test(String(value));
