import { ethers } from 'ethers';
import { sha3_256 } from 'js-sha3';

/**
 * This function creates an ID in the same way that core does on the backend. This way we
 * Can match up the newly created order with incoming orders via a subscription
 */
export const determineId = (sig: string) => {
  return sha3_256(ethers.utils.arrayify('0x' + sig));
};
