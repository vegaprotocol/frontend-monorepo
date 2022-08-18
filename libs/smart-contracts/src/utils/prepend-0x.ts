const ZERO_X = '0x';

export function prepend0x(str: string) {
  return `${ZERO_X}${str}`;
}

export function prepend0xIfNeeded(str: string) {
  if (str.indexOf(ZERO_X) === 0) return str;
  return prepend0x(str);
}

export function remove0x(str: string) {
  if (str.indexOf(ZERO_X) === 0) return str.substring(2);
  return str;
}
