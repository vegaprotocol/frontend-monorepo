import {
  getDateFormat,
  getDateTimeFormat,
  getTimeFormat,
} from '@vegaprotocol/utils';

export const nanoSecondsToMilliseconds = (nanoSeconds: string | number) => {
  return Math.round(+nanoSeconds / 1e6);
};

export const formatNanoDate = (nanoSeconds: string | number) => {
  try {
    const milliseconds = nanoSecondsToMilliseconds(nanoSeconds.toString());
    if (Number.isNaN(milliseconds)) throw new Error('Invalid time value');
    return formatDateTime(milliseconds);
  } catch {
    return `Invalid time value: ${nanoSeconds}`;
  }
};

export const formatDateTime = (milliseconds: number | string) => {
  try {
    return getDateTimeFormat().format(new Date(+milliseconds));
  } catch {
    return `Invalid time value: ${milliseconds}`;
  }
};

export const formatDate = (date: number | string | Date) => {
  try {
    return getDateFormat().format(new Date(date));
  } catch {
    return `Invalid time value: ${date}`;
  }
};

export const formatTime = (date: number | string | Date) => {
  try {
    return getTimeFormat().format(new Date(date));
  } catch {
    return `Invalid time value: ${date}`;
  }
};

export const REJECTION_ERROR_MESSAGE =
  'Invalid passphrase or corrupted storage';
