/**
 * Returns a reasonably formatted time from unix timestamp of block height
 *
 * @param date String or null date
 * @returns String date in locale time
 */
export function getBlockTime(date?: string, locale?: Intl.LocalesArgument) {
  try {
    if (!date) {
      throw new Error('No date provided');
    }

    const timeInSeconds = parseInt(date, 10);

    if (isNaN(timeInSeconds)) {
      throw new Error('Invalid date');
    }

    const timeInMs = timeInSeconds * 1000;

    return new Date(timeInMs).toLocaleString(locale);
  } catch (e) {
    return '-';
  }
}
