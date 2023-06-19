export const ELLIPSIS = '\u2026';

export function truncateByChars(input: string, start = 6, end = 6) {
  // if the text is shorted than the total number of chars to show
  // no truncation is needed. Plus one is to account for the ellipsis
  if (input.length <= start + end + 1) {
    return input;
  }

  const s = input.slice(0, start);  
  const e = end !== 0 ? input.slice(-end) : ''
  return `${s}${ELLIPSIS}${e}`
}

export function shorten(input: string, limit?: number) {
  if (!input || !limit || input.length < limit || limit <= 0) {
    return input;
  }
  const output = input.substring(0, limit - 1);
  const suffix = output.length < limit ? ELLIPSIS : '';
  return input.substring(0, limit - 1) + suffix;
}

const TITLE_SEPARATOR = ' - ';
const TITLE_SUFFIX = 'Vega';
export function titlefy(words: (string | null | undefined)[]) {
  const title = [...words, TITLE_SUFFIX]
    .filter((w) => w && w.length > 0)
    .join(TITLE_SEPARATOR);
  return title;
}

export function stripFullStops(input: string) {
  return input.replace(/\./g, '');
}
