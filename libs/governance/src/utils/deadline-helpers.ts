import { parse as ISO8601Parse, toSeconds } from 'iso8601-duration';

// Converts API deadlines ("XhXmXs") to seconds
export const deadlineToSeconds = (deadline: string) => {
  // check that the deadline string matches the format "XhXmXs"
  const regex = /^(\d+h)?(\d+m)?(\d+s)?$/;
  if (!regex.test(deadline)) {
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
