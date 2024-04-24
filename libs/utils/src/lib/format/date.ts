import once from 'lodash/once';
import { format } from 'date-fns';
import { getUserLocale } from '../get-user-locale';

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

/** Returns a user's local time zone abbreviation */
export const getTimeZoneAbbreviation = (date: Date) => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(date);
  const timeZoneAbbreviation = parts.find(
    (part) => part.type === 'timeZoneName'
  )?.value;
  return timeZoneAbbreviation || '';
};

/** Format a user's local date and time with the time zone abbreviation */
export const formatDateWithLocalTimezone = (
  date: Date,
  formatStr = 'dd MMMM yyyy HH:mm'
) => {
  const formattedDate = format(date, formatStr);
  const timeZoneAbbreviation = getTimeZoneAbbreviation(date);
  return `${formattedDate} (${timeZoneAbbreviation})`;
};
