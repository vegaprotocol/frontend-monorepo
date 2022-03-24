import once from 'lodash/once';
import memoize from 'lodash/memoize';
import { addDecimal } from '../decimals';

const getUserLocale = () => 'default';

export const splitAt = (index: number) => (x: string) =>
  [x.slice(0, index), x.slice(index)];

export const getTimeFormat = once(
  () =>
    new Intl.DateTimeFormat(getUserLocale(), {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
);

export const getDateFormat = once(
  () =>
    new Intl.DateTimeFormat(getUserLocale(), {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
);

export const getDateTimeFormat = once(
  () =>
    new Intl.DateTimeFormat(getUserLocale(), {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export const getNumberFormat = memoize(
  (minimumFractionDigits: number) =>
    new Intl.NumberFormat(getUserLocale(), { minimumFractionDigits })
);

export const getRelativeTimeFormat = once(
  () => new Intl.RelativeTimeFormat(getUserLocale())
);

export const formatNumber = (rawValue: string, decimalPlaces: number) => {
  const x = addDecimal(rawValue, decimalPlaces);

  return getNumberFormat(decimalPlaces).format(Number(x));
};
