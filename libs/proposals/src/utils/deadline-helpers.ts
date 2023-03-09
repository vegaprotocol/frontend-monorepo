import { parse as ISO8601Parse, toSeconds } from 'iso8601-duration';
import { addMinutes, subSeconds } from 'date-fns';

const deadlineRegexChecker = (deadline: string) => {
  // check that the deadline string matches the format "XhXmXs"
  const regex = /^(\d+h)?(\d+m)?(\d+s)?$/;
  return regex.test(deadline);
};

// Converts API deadlines ("XhXmXs") to seconds
export const deadlineToSeconds = (deadline: string) => {
  if (!deadlineRegexChecker(deadline)) {
    throw new Error(
      `Invalid deadline format, expected format "XhXmXs", got "${deadline}"`
    );
  }
  return toSeconds(ISO8601Parse(`PT${deadline.toUpperCase()}`));
};

// Converts seconds to rounded hours, min 1 hour
export const secondsToRoundedHours = (seconds: number) => {
  const hours = Math.round(seconds / 3600);
  return hours < 1 ? 1 : hours;
};

export const deadlineToRoundedHours = (deadline: string) =>
  secondsToRoundedHours(deadlineToSeconds(deadline));

export const doesValueEquateToParam = (value: string, param: string) =>
  value === deadlineToRoundedHours(param).toString();

export const addTwoMinutes = (date?: Date) => addMinutes(date || new Date(), 2);

export const subtractTwoSeconds = (date?: Date) =>
  subSeconds(date || new Date(), 2);
