import { ethers } from 'ethers';
import { SHA3 } from 'sha3';
import { remove0x } from './remove-0x';

/**
 * This function creates an ID in the same way that core does on the backend. This way we
 * Can match up the newly created order with incoming orders via a subscription
 */
export const determineId = (sig: string) => {
  const hash = new SHA3(256);
  hash.update(sig, 'hex');
  const id = hash.digest('hex');
  // Remove 0x as core doesn't keep them in the API
  return remove0x(id);
};
