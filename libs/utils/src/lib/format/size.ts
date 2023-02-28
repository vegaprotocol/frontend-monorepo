/**
 * Returns a number prefixed with either a '-' or a '+'. The open volume field
 * already comes with a '-' if negative so we only need to actually prefix if
 * its a positive value
 */
export function volumePrefix(value: string): string {
  if (value === '0' || value.startsWith('-')) {
    return value;
  }

  return '+' + value;
}
