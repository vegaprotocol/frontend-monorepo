export function prepend0x(str: string) {
  return !str || str.indexOf('0x') === 0 ? str : `0x${str}`;
}
