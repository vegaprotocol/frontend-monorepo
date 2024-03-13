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

type Duration = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const convertToDuration = (time: number): Duration => {
  const s = 1000;
  const m = 1000 * 60;
  const h = 1000 * 60 * 60;
  const d = 1000 * 60 * 60 * 24;

  const t = Math.abs(time);

  const days = Math.floor(t / d);
  const hours = Math.floor((t - days * d) / h);
  const minutes = Math.floor((t - days * d - hours * h) / m);
  const seconds = Math.floor((t - days * d - hours * h - minutes * m) / s);

  return { days, hours, minutes, seconds };
};

/**
 * Converts given time in ms to countdown string, e.g. 1d20h34m10s
 */
export const convertToCountdownString = (
  time: number,
  pattern = '0d00h00m00s'
) => {
  const values = Object.values(convertToDuration(time));

  let i = 0;
  const countdown = pattern
    .replace(/00*/g, (match) => {
      const value = String(values[i++]);
      if (value.length < match.length) {
        const filler = Array(match.length - value.length)
          .fill('0')
          .join('');
        return `${filler}${value}`;
      }

      return value;
    })
    .replace(/^00*[^\d]*/g, '') // replace leading 00, e.g. 00d01h23m45s -> 01h23m45s
    .replace(/^00[^\d]*/g, ''); // replace leading 00, e.g. 00d00h23m45s -> 23m45s

  return countdown;
};
