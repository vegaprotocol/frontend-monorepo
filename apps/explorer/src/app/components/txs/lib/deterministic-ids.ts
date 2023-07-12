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

  const paddedHex = hex.length % 2 !== 0 ? `0${hex}` : hex;

  const bytes = [];
  for (let n = 0; n < paddedHex.length; n += 2) {
    const code = parseInt(paddedHex.substring(n, n + 2), 16);
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

export type stopSignatures = {
  risesAboveId: string;
  fallsBelowId: string;
};

/**
 * Given a stop order signature string, returns the deterministic IDs of both potential
 * orders
 *
 * @param signature
 * @returns stopSignatures
 */
export function stopOrdersSignatureToDeterministicId(
  signature?: string
): stopSignatures {
  if (!signature) {
    return {
      risesAboveId: '',
      fallsBelowId: '',
    };
  }

  const fallsBelowId = txSignatureToDeterministicId(signature);
  const risesAboveId = sha3_256.create().update(fallsBelowId).hex();

  return {
    fallsBelowId,
    risesAboveId,
  };
}
