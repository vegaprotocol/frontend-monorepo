export function truncateByChars(s: string, startChars = 6, endChars = 6) {
  const ELLIPSIS = '\u2026';

  // if the text is shorted than the total number of chars to show
  // no truncation is needed. Plus one is to account for the ellipsis
  if (s.length <= startChars + endChars + 1) {
    return s;
  }

  const start = s.slice(0, startChars);
  const end = s.slice(-endChars);

  return start + ELLIPSIS + end;
}
