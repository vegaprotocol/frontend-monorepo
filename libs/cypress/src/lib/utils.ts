import { ethers } from 'ethers';
import sha3 from 'js-sha3';
import BigNumber from 'bignumber.js';

/**
 * copy of determineId in libs/wallet/src/utils.ts
 * to avoid pulling in any jsx files which will cypress is not set up to compile
 */
export function determineId(sig: string) {
  return sha3.sha3_256(ethers.utils.arrayify('0x' + sig));
}

/**
 * copy of removeDecimal from libs/react-helpers/src/lib/format/number.tsx
 * to avoid pulling in any jsx files which will cypress is not set up to compile
 */
export function removeDecimal(value: string, decimals: number): string {
  if (!decimals) return value;
  return new BigNumber(value || 0).times(Math.pow(10, decimals)).toFixed(0);
}
