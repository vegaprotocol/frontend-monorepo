/**
 * Returns a reasonably formatted time from unix timestamp of block height
 *
 * @param date String or null date
 * @returns String date in locale time
 */
export function getBlockTime(date?: string) {
  if (!date) {
    return '-';
  }

  const timeInSeconds = parseInt(date, 10);
  const timeInMs = timeInSeconds * 1000;

  return new Date(timeInMs).toLocaleString();
}
