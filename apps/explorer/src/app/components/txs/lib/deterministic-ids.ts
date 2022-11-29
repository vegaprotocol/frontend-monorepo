import { sha3_256 } from 'js-sha3';

/**
 * Encodes a string as bytes
 * @param hex
 * @returns number[]
 */
export function hexToString(hex: string) {
  if (!hex.match(/^[0-9a-fA-F]+$/)) {
    throw new Error('is not a hex string.');
  }
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  const bytes = [];
  for (let n = 0; n < hex.length; n += 2) {
    const code = parseInt(hex.substr(n, 2), 16);
    bytes.push(code);
  }
  return bytes;
}

/**
 * Given a transaction signature string, returns the deterministic
 * ID that the transaction will get. This works for:
 * - orders
 * - proposals
 *
 * @param signature
 * @return string deterministic id
 */
export function txSignatureToDeterministicId(signature: string): string {
  const bytes = hexToString(signature);
  const hash = sha3_256.create();

  hash.update(bytes);

  return hash.hex();
}
