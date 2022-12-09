import { parseISO, isValid } from 'date-fns';

export const toNanoSeconds = (date: Date | string) => {
  return new Date(date).getTime().toString() + '000000';
};

export const fromNanoSeconds = (ts: string) => {
  const val = parseISO(ts);
  return new Date(isValid(val) ? val : 0);
};
