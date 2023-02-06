import { parseISO, isValid } from 'date-fns';

export const toNanoSeconds = (date: Date | string) => {
  return new Date(date).getTime().toString() + '000000';
};

export const fromISONano = (ts: string) => {
  const val = parseISO(ts);
  return new Date(isValid(val) ? val : 0);
};

export const fromNanoSeconds = (ts: string | number) => {
  const ms = Number(String(ts).slice(0, -6));
  return new Date(ms);
};
