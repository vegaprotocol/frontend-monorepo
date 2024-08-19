import BigNumber from 'bignumber.js';

BigNumber.config({
  FORMAT: getFormat(),

  // Always round down.
  // Given a value of 1999 and dps of 1. When formatting
  // with 0 decimal places this should not round to 200
  // the value should be 199
  ROUNDING_MODE: 3,
});

type Value = string | number | BigNumber | undefined | null;

/**
 * Wraps a bignumber.js instance, created with a decimal places
 * value, allowing for easier (and safe) mathematical operations
 * on values (eg price and size) that are received as big integer
 * strings
 */
export class Decimal {
  value: BigNumber;
  decimals: number;
  rawValue: string;

  constructor(v: Value, decimals = 0) {
    const value = v ?? '0';
    this.decimals = decimals;
    this.rawValue = String(value);
    this.value = Decimal.toBigNum(value, decimals);
  }

  static toBigNum(value: Value, decimals = 0) {
    return BigNumber(value ?? 0).div(Decimal.quotient(decimals));
  }

  static toString(value: Value, decimals = 0) {
    if (value === undefined) return;
    return new BigNumber(value ?? 0)
      .times(Decimal.quotient(decimals))
      .toFixed(0);
  }

  static quotient(decimals = 0) {
    return new BigNumber(10).exponentiatedBy(decimals);
  }

  static format(value: Value, decimals = 0, formatDecimals?: number) {
    return Decimal.toBigNum(value, decimals).toFormat(formatDecimals);
  }

  toFormat(formatDecimals?: number) {
    return this.value.toFormat(formatDecimals);
  }

  valueOf() {
    return this.value;
  }
}

/**
 * Get the users locale, will default to the users
 * browser/os setting
 */
function getUserLocale() {
  return 'default';
}

/**
 * Get formatting symbols from the users browser and use them
 * to create a bignumber.js FORMAT config file. This means we don't
 * need to convert any values to true 'number' types which
 * may lose precision
 */
function getFormat() {
  const parts = new Intl.NumberFormat(getUserLocale()).formatToParts(1000.1);

  const decimal = parts.find((p) => p.type === 'decimal');
  const group = parts.find((p) => p.type === 'group');

  if (!decimal) {
    throw new Error('could not get decimal separator');
  }

  if (!group) {
    throw new Error('could not get group separator');
  }

  return {
    decimalSeparator: decimal.value,
    groupSeparator: group.value,
    groupSize: 3,
  };
}
