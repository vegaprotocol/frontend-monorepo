export function truncateMiddle(address: string) {
  if (address.length < 11) return address;
  return (
    address.slice(0, 6) +
    '\u2026' +
    address.slice(address.length - 4, address.length)
  );
}
