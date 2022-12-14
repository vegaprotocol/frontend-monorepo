import { ethers } from 'ethers';
import sha3 from 'js-sha3';
import type { Transaction } from '@vegaprotocol/wallet';

/**
 * Base64 encode a transaction object
 */
export const encodeTransaction = (tx: Transaction): string => {
  return ethers.utils.base64.encode(
    ethers.utils.toUtf8Bytes(JSON.stringify(tx))
  );
};

/**
 * Convert a Vega transaction signature to an object ID
 */
export function determineId(sig: string) {
  return sha3.sha3_256(ethers.utils.arrayify('0x' + sig));
}
