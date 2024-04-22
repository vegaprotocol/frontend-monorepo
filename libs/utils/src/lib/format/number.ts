import { BigNumber } from 'bignumber.js';
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

/**
 * Converts "raw" value to a decimal representation as a `BigNumber`
 *
 * Example:
 *  `toBigNum(1, 3)` -> 0.001
 *  `toBigNum(1234, 2)` -> 12.34
 *
 * @param rawValue The "raw" value
 * @param decimals The number of decimal places
 */
export function toBigNum(
  rawValue: string | number | BigNumber,
  decimals: number
): BigNumber {
  const d = new BigNumber(10).exponentiatedBy(decimals);
  return new BigNumber(rawValue || 0).dividedBy(d);
}

/**
 * Reverses `toBigNum` - converts given decimal representation
 * as a "raw" value (`BigNumber`)
 *
 * Example:
 *   `formBigNum(5.4321, 4)` -> 54321
 *   `formBigNum(112.34, 2)` -> 11234
 */
export const fromBigNum = (
  input: string | number | BigNumber,
  decimals: number
) => {
  const d = new BigNumber(10).exponentiatedBy(decimals);
  return new BigNumber(input).times(d);
};

export function toDecimal(numberOfDecimals: number) {
  return toBigNum(1, numberOfDecimals).toString(10);
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

export const getDecimalSeparator = memoize(
  () =>
    new Intl.NumberFormat(getUserLocale())
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')?.value ?? '.'
);

export const getGroupFormat = memoize(() => {
  const parts = new Intl.NumberFormat(getUserLocale()).formatToParts(
    100000000000.1
  );
  const groupSeparator = parts.find((part) => part.type === 'group')?.value;
  const groupSize =
    (groupSeparator &&
      parts.reverse().find((part) => part.type === 'integer')?.value.length) ||
    0;
  return {
    groupSize,
    groupSeparator,
  };
});

const getFormat = memoize(() => ({
  decimalSeparator: getDecimalSeparator(),
  ...getGroupFormat(),
}));

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
  const decimalPlaces = Math.min(
    Math.max(0, formatDecimals),
    MAX_FRACTION_DIGITS
  );
  const format = getFormat();
  const formatted = new BigNumber(rawValue).toFormat(decimalPlaces, format);
  // if there are no decimal places just return formatted value
  if (!decimalPlaces) {
    return formatted;
  }
  // minimum number of decimal places to keep when removing trailing zeros
  const minimumFractionDigits = Math.min(decimalPlaces, MIN_FRACTION_DIGITS);
  const parts = formatted.split(format.decimalSeparator);
  parts[1] = (parts[1] || '')
    .replace(/0+$/, '')
    .padEnd(minimumFractionDigits, '0');
  return parts.join(format.decimalSeparator);
};

/** formatNumberFixed will format the number with fixed decimals
 * @param rawValue - should be a number that is not outside the safe range fail as in https://mikemcl.github.io/bignumber.js/#toN
 * @param formatDecimals - number of decimals to use
 */
export const formatNumberFixed = (
  rawValue: string | number | BigNumber,
  formatDecimals = 0
) => {
  return new BigNumber(rawValue).toFormat(
    Math.min(Math.max(0, formatDecimals), MAX_FRACTION_DIGITS),
    getFormat()
  );
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

export const getFormatDecimalsFromQuantum = (
  decimalPlaces: number,
  quantum: number | string
) => {
  return Math.max(
    MIN_FRACTION_DIGITS,
    Math.ceil(Math.abs(Math.log10(toBigNum(quantum, decimalPlaces).toNumber())))
  );
};

export const addDecimalsFormatNumberQuantum = (
  rawValue: string | number,
  decimalPlaces: number,
  quantum: number | string
) => {
  if (isNaN(Number(quantum))) {
    return addDecimalsFormatNumber(rawValue, decimalPlaces);
  }
  const length = (typeof rawValue === 'number' ? rawValue.toFixed() : rawValue)
    .length;
  const formatDecimals = getFormatDecimalsFromQuantum(decimalPlaces, quantum);
  return addDecimalsFormatNumber(
    rawValue,
    decimalPlaces,
    Math.max(decimalPlaces - length + 1, formatDecimals)
  );
};

export const addDecimalsFormatNumber = (
  rawValue: string | number,
  decimalPlaces: number,
  formatDecimals: number = decimalPlaces
) => {
  return formatNumber(
    new BigNumber(rawValue || 0).dividedBy(Math.pow(10, decimalPlaces)),
    formatDecimals
  );
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

export const isSafeInteger = (x: unknown): x is number => {
  return x != null && typeof x === 'number' && Number.isSafeInteger(x);
};
