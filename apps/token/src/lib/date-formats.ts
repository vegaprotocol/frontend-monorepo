import { utcToZonedTime, format as tzFormat } from 'date-fns-tz';

export const DATE_FORMAT_DETAILED = 'dd MMMM yyyy HH:mm';
export const DATE_FORMAT_LONG = 'dd MMM yyyy';

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
