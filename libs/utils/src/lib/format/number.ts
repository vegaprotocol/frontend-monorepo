import { BigNumber } from 'bignumber.js';
import isNil from 'lodash/isNil';
import memoize from 'lodash/memoize';

import { getUserLocale } from '../get-user-locale';

/**
 * A raw unformatted value greater than this is considered and displayed
 * as UNLIMITED.
 */
export const UNLIMITED_THRESHOLD = new BigNumber(2).pow(256).times(0.8);
/**
 * Gets the unlimited threshold value for given decimal places.
 * @param decimalPlaces the asset's decimal places
 */
export const getUnlimitedThreshold = (decimalPlaces: number) =>
  UNLIMITED_THRESHOLD.dividedBy(Math.pow(10, decimalPlaces));

const MIN_FRACTION_DIGITS = 2;
const MAX_FRACTION_DIGITS = 20;

export function toDecimal(numberOfDecimals: number) {
  return new BigNumber(1)
    .dividedBy(new BigNumber(10).exponentiatedBy(numberOfDecimals))
    .toString(10);
}

export function toBigNum(
  rawValue: string | number | BigNumber,
  decimals: number
): BigNumber {
  const divides = new BigNumber(10).exponentiatedBy(decimals);
  return new BigNumber(rawValue || 0).dividedBy(divides);
}

export function addDecimal(
  value: string | number,
  decimals: number,
  decimalPrecision = decimals
): string {
  if (!decimals) return value.toString();
  if (!decimalPrecision || decimalPrecision < 0) {
    return toBigNum(value, decimals).toFixed(0);
  }
  return toBigNum(value, decimals).toFixed(decimalPrecision);
}

export function removeDecimal(
  value: string | BigNumber,
  decimals: number
): string {
  const times = new BigNumber(10).exponentiatedBy(decimals);
  return new BigNumber(value || 0).times(times).toFixed(0);
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

export const getGroupSeparator = memoize(
  () =>
    getNumberFormat(1)
      .formatToParts(100000000000)
      .find((part) => part.type === 'group')?.value
);

export const getGroupSize = memoize(
  () =>
    getNumberFormat(1)
      .formatToParts(100000000000)
      .reverse()
      .find((part) => part.type === 'integer')?.value.length
);

/**
 * formatNumber will format the number with maximum number of decimals
 * trailing zeros are removed but min(MIN_FRACTION_DIGITS, formatDecimals) decimal places will be kept
 * @param rawValue - should be a number that is not outside the safe range fail as in https://mikemcl.github.io/bignumber.js/#toN
 * @param formatDecimals - number of decimals to use
 */
export const formatNumber = (
  rawValue: string | number | BigNumber,
  formatDecimals = 0
) => {
  const decimalSeparator = getDecimalSeparator() || '.';
  const groupSeparator = getGroupSeparator();
  const groupSize = groupSeparator ? getGroupSize() : 0;
  const decimalPlaces = Math.max(0, formatDecimals);
  const formatted = new BigNumber(rawValue).toFormat(decimalPlaces, {
    decimalSeparator,
    groupSeparator,
    groupSize,
  });
  // if there are no decimal places just return formatted value
  if (!decimalPlaces) {
    return formatted;
  }
  // minimum number of decimal places to keep when removing trailing zeros
  const minimumFractionDigits = Math.min(decimalPlaces, MIN_FRACTION_DIGITS);
  const parts = formatted.split(decimalSeparator);
  parts[1] = (parts[1] || '')
    .replace(/0+$/, '')
    .padEnd(minimumFractionDigits, '0');
  return parts.join(decimalSeparator);
};

/** formatNumberFixed will format the number with fixed decimals
 * @param rawValue - should be a number that is not outside the safe range fail as in https://mikemcl.github.io/bignumber.js/#toN
 * @param formatDecimals - number of decimals to use
 */
export const formatNumberFixed = (
  rawValue: string | number | BigNumber,
  formatDecimals = 0
) => {
  return new BigNumber(rawValue).toFormat(Math.max(0, formatDecimals));
};

export const quantumDecimalPlaces = (
  /** Raw asset's quantum value */
  rawQuantum: number | string,
  /** Asset's decimal places */
  decimalPlaces: number
) => {
  // if raw quantum value is an empty string then it'll evaluate to 0
  // this check ignores NaNs and zeroes
  const formatDecimals =
    isNaN(Number(rawQuantum)) || Number(rawQuantum) === 0
      ? decimalPlaces
      : Math.max(
          0,
          Math.log10(100 / Number(addDecimal(rawQuantum, decimalPlaces)))
        );

  return Math.ceil(formatDecimals);
};

export const addDecimalsFormatNumberQuantum = (
  rawValue: string | number,
  decimalPlaces: number,
  quantum: number | string
) => {
  if (isNaN(Number(quantum))) {
    return addDecimalsFormatNumber(rawValue, decimalPlaces);
  }
  const numberDP = Math.ceil(
    Math.abs(Math.log10(toBigNum(quantum, decimalPlaces).toNumber()))
  );
  return addDecimalsFormatNumber(
    rawValue,
    decimalPlaces,
    Math.max(MIN_FRACTION_DIGITS, numberDP)
  );
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

export const formatNumberPercentage = (
  value: BigNumber | null | undefined,
  decimals?: number
) => {
  if (!value) {
    return '-';
  }

  const decimalPlaces =
    typeof decimals === 'undefined' ? value.dp() || 0 : decimals;
  return `${formatNumber(value, decimalPlaces)}%`;
};

export const toNumberParts = (
  value: BigNumber | null | undefined,
  decimals = 18
): [integers: string, decimalPlaces: string, separator: string] => {
  if (!value) {
    return ['0', '0'.repeat(decimals), '.'];
  }
  const separator = getDecimalSeparator() || '.';
  const [integers, decimalsPlaces] = formatNumber(value, decimals)
    .toString()
    .split(separator);
  return [integers, decimalsPlaces || '', separator];
};

export const isNumeric = (
  value?: string | number | BigNumber | bigint | null
): value is NonNullable<number | string> => /^-?\d*\.?\d+$/.test(String(value));

/**
 * Format a number greater than 1 million with m for million, b for billion
 * and t for trillion
 */
export const formatNumberRounded = (
  num: BigNumber,
  limit: '1e12' | '1e9' | '1e6' | '1e3' = '1e6'
) => {
  let value = '';

  const format = (divisor: string) => {
    const result = num.dividedBy(divisor);
    return result.isInteger() ? result.toString() : result.toFixed(1);
  };

  if (num.isGreaterThan(new BigNumber('1e14'))) {
    value = '>100t';
  } else if (
    num.isGreaterThanOrEqualTo(limit) &&
    num.isGreaterThanOrEqualTo(new BigNumber('1e12'))
  ) {
    // Trillion
    value = `${format('1e12')}t`;
  } else if (
    num.isGreaterThanOrEqualTo(limit) &&
    num.isGreaterThanOrEqualTo(new BigNumber('1e9'))
  ) {
    // Billion
    value = `${format('1e9')}b`;
  } else if (
    num.isGreaterThanOrEqualTo(limit) &&
    num.isGreaterThanOrEqualTo(new BigNumber('1e6'))
  ) {
    // Million
    value = `${format('1e6')}m`;
  } else if (
    num.isGreaterThanOrEqualTo(limit) &&
    num.isGreaterThanOrEqualTo(new BigNumber('1e3'))
  ) {
    value = `${format('1e3')}k`;
  } else {
    value = formatNumber(num);
  }

  return value;
};

/**
 * Converts given amount in one asset (determined by raw amount
 * and quantum values) to qUSD.
 * @param amount The raw amount
 * @param quantum The quantum value of the asset.
 */
export const toQUSD = (
  amount: string | number | BigNumber,
  quantum: string | number
) => {
  const value = new BigNumber(amount);
  let q = new BigNumber(quantum);

  if (q.isNaN() || q.isLessThanOrEqualTo(0)) {
    q = new BigNumber(1);
  }

  const qUSD = value.dividedBy(q);
  return qUSD;
};
