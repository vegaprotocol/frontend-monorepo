export function truncateMiddle(address: string) {
  return (
    address.slice(0, 6) +
    "\u2026" +
    address.slice(address.length - 4, address.length)
  );
}
