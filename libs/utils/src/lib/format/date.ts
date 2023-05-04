import once from 'lodash/once';
import { getUserLocale } from '../get-user-locale';
import { utcToZonedTime, format as tzFormat } from 'date-fns-tz';

export const isValidDate = (date: Date) =>
  date instanceof Date && !isNaN(date.getTime());

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

/** Format a user's local date and time with the time zone abbreviation */
export const formatDateWithLocalTimezone = (
  date: Date,
  formatStr = 'dd MMMM yyyy HH:mm (z)'
) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDatetime = utcToZonedTime(date, userTimeZone);

  return tzFormat(localDatetime, formatStr, {
    timeZone: userTimeZone,
  });
};
