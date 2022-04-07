import once from 'lodash/once';
import { getUserLocale } from './utils';

/**
 * Returns a number prefixed with either a '-' or a '+'. The open volume field
 * already comes with a '-' if negative so we only need to actually prefix if
 * its a positive value
 */
export function volumePrefix(value: string): string {
  if (value === '0' || value.startsWith('-')) {
    return value;
  }

  return '+' + value;
}

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

export const getRelativeTimeFormat = once(
  //@ts-ignore TODO check this
  () => new Intl.RelativeTimeFormat(getUserLocale())
);

/** Returns date in a format suitable for input[type=date] elements */
export const formatForInput = (date: Date) => {
  const padZero = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const secs = padZero(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${secs}`;
};
