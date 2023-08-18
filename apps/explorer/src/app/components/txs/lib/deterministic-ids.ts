import type { components } from '../../../../types/explorer';
import { sha3_256 } from 'js-sha3';
type StopOrderSetup = components['schemas']['v1StopOrderSetup'];

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

/**
 * Given a stop order signature string, returns the deterministic IDs of both potential
 * Stop Orders. A stop order is not an order per se, but a trigger for an order. The order
 * created by the stop order will have another ID based on the market event that hit the
 * trigger, and as such is not deterministic.
 *
 * @param signature
 * @returns string[]
 */
export function stopOrdersSignatureToDeterministicId(
  signature?: string
): string[] {
  if (!signature) {
    return [];
  }

  const firstId = txSignatureToDeterministicId(signature);
  return [firstId, txSignatureToDeterministicId(firstId)];
}

export type stopSignatures = {
  risesAboveId: string | undefined;
  fallsBelowId: string | undefined;
};

/**
 * In 0.72.10 the way stop order IDs are determined is a little tricky. It will be stabilised
 * in a future release.
 * @param deterministicIds Output of stopORdersSignatureToDeterministicId
 * @param risesAbove Stop order setup
 * @param fallsBelow Stop order setup
 * @returns Object containing the deterministic IDs of the stop orders
 */
export function getStopOrderIds(
  deterministicIds: string[],
  risesAbove: StopOrderSetup | undefined,
  fallsBelow: StopOrderSetup | undefined
) {
  if (risesAbove && fallsBelow) {
    return {
      risesAboveId: deterministicIds[0],
      fallsBelowId: deterministicIds[1],
    };
  } else if (!fallsBelow && risesAbove) {
    return {
      risesAboveId: deterministicIds[0],
    };
  } else {
    return {
      fallsBelowId: deterministicIds[0] || undefined,
      risesAboveId: deterministicIds[1] || undefined,
    };
  }
}
