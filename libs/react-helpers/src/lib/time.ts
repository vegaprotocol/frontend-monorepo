import { parseISO, isValid } from 'date-fns';

export const toNanoSeconds = (date: Date | string) => {
  return new Date(date).getTime().toString() + '000000';
};

export const fromNanoSeconds = (ts: string) => {
  const val = parseISO(ts);
  return new Date(isValid(val) ? val : 0);
};

/**
 * Parses the interval string we get for the epoch length from the
 * network parameter API. These are in the format '1D2H3m' for 1 day,
 * 2 hours and 3 minutes.
 *
 * @param str Interval string
 * @returns integer the number of seconds the interval represents
 */
export function getSecondsFromInterval(str: string) {
  let seconds = 0;

  if (!str || !str.match) {
    return seconds;
  }

  const months = str.match(/(\d+)\s*M/);
  const days = str.match(/(\d+)\s*D/);
  const hours = str.match(/(\d+)\s*h/);
  const minutes = str.match(/(\d+)\s*m/);
  const secs = str.match(/(\d+)\s*s/);
  if (months) {
    seconds += parseInt(months[1]) * 86400 * 30;
  }
  if (days) {
    seconds += parseInt(days[1]) * 86400;
  }
  if (hours) {
    seconds += parseInt(hours[1]) * 3600;
  }
  if (minutes) {
    seconds += parseInt(minutes[1]) * 60;
  }
  if (secs) {
    seconds += parseInt(secs[1]);
  }
  return seconds;
}
