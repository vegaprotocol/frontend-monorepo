import { BigNumber } from 'bignumber.js';
import isNil from 'lodash/isNil';
import memoize from 'lodash/memoize';

import { getUserLocale } from '../get-user-locale';

const DEFAULT_DECIMAL_SEPARATOR = '.';
const DEFAULT_GROUP_SEPARATOR = ',';

// get formatting characters for users locale
export const getNumberParts = memoize(() => {
  // 1000.1 will get us a group character (, for thousand groups, . for decimals in en-GB)
  const parts = new Intl.NumberFormat(getUserLocale()).formatToParts(1000.1);

  const decimalSeparator = parts.find((part) => part.type === 'decimal');
  const groupSeparator = parts.find((part) => part.type === 'group');

  if (!decimalSeparator) {
    console.warn('Could not get locales decimalSeparator');
  }

  if (!groupSeparator) {
    console.warn('Could not get locales groupSeparator');
  }

  return {
    decimalSeparator: decimalSeparator
      ? decimalSeparator.value
      : DEFAULT_DECIMAL_SEPARATOR,
    groupSeparator: groupSeparator
      ? groupSeparator.value
      : DEFAULT_GROUP_SEPARATOR,
  };
});

const parts = getNumberParts();

// Format for bignumber formatting
const FORMAT = {
  prefix: '',
  decimalSeparator: parts.decimalSeparator,
  groupSeparator: parts.groupSeparator,
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: '',
};

BigNumber.config({ FORMAT });

export const isNumeric = (
  value?: string | number | BigNumber | bigint | null
): value is NonNullable<number | string> => /^-?\d*\.?\d+$/.test(String(value));

export const toNumberParts = (
  value: BigNumber | null | undefined
): [integers: string, decimalPlaces: string, separator: string] => {
  if (!value) {
    return ['0', '', '.'];
  }

  const separator = getNumberParts().decimalSeparator;

  const dps = value.dp() || 0;

  const [integers, decimalsPlaces] = formatNumber(value, dps)
    .toString()
    .split(separator);

  return [integers, decimalsPlaces || '', separator];
};

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
  rawValue: string | number,
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

/** formatNumber will format the number with fixed decimals
 * @param rawValue - should be a number that is not outside the safe range fail as in https://mikemcl.github.io/bignumber.js/#toN
 * @param formatDecimals - number of decimals to use
 */
export const formatNumber = (
  rawValue: string | number | BigNumber,
  formatDecimals = 0
) => {
  return new BigNumber(rawValue).toFormat(formatDecimals);
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
          Math.log10(
            new BigNumber(100)
              .dividedBy(toBigNum(rawQuantum, decimalPlaces))
              .toNumber()
          )
        );

  return Math.ceil(formatDecimals);
};

export const addDecimalsFormatNumberQuantum = (
  rawValue: string | number,
  decimalPlaces: number,
  quantum: number | string
) => {
  const val = toBigNum(rawValue, decimalPlaces);
  let formatDps = val.dp() ?? decimalPlaces;

  if (isNaN(Number(quantum))) {
    return val.toFormat(formatDps);
  }

  formatDps = quantumDecimalPlaces(quantum, decimalPlaces);

  return val.toFormat(formatDps);
};

export const addDecimalsFormatNumber = (
  rawValue: string | number,
  decimalPlaces: number,
  formatDecimals?: number
) => {
  const val = toBigNum(rawValue, decimalPlaces);
  const naturalDp = val.dp() ?? 0;
  const formatDps = Math.max(
    0,
    formatDecimals === undefined ? naturalDp : formatDecimals
  );
  return val.toFormat(formatDps || 0);
};

export const formatNumberPercentage = (
  value: BigNumber,
  formatDecimals?: number
) => {
  const decimalPlaces =
    typeof formatDecimals === 'undefined' ? value.dp() || 0 : formatDecimals;
  return `${value.toFormat(decimalPlaces)}%`;
};

/**
 * Format a number greater than 1 million with m for million, b for billion
 * and t for trillion
 */
export const formatNumberRounded = (num: BigNumber) => {
  let value = '';

  const format = (divisor: string) => {
    const result = num.dividedBy(divisor);
    return result.isInteger() ? result.toString() : result.toFixed(1);
  };

  if (num.isGreaterThan(new BigNumber('1e14'))) {
    value = '>100t';
  } else if (num.isGreaterThanOrEqualTo(new BigNumber('1e12'))) {
    // Trillion
    value = `${format('1e12')}t`;
  } else if (num.isGreaterThanOrEqualTo(new BigNumber('1e9'))) {
    // Billion
    value = `${format('1e9')}b`;
  } else if (num.isGreaterThanOrEqualTo(new BigNumber('1e6'))) {
    // Million
    value = `${format('1e6')}m`;
  } else {
    value = num.toFormat();
  }

  return value;
};
