import { keccak256, defaultAbiCoder } from 'ethers/lib/utils';
import type { AbiType } from './abi-types';

export const BRIDGE_COMMAND: AbiType[] = [
  // The abi encoded bytes of the message
  'bytes',
  // The address of the bridge
  'address',
];

/**
 * ABI encode values for a bridge call, getting back its digest
 *
 * @param bytes The packed bytes of the command for the bridge
 * @param address the Ethereum address of the ERC20 bridge
 * @param raw defaults to false. If set, does not keccak256 the output
 * @returns
 */
export function encodeBridgeCommand(
  bytes: string,
  address: string,
  raw = false
) {
  if (address.substring(0, 2) !== '0x') {
    throw new Error('Bridge address must be a hex value');
  }

  const values = [bytes, address];

  const value = defaultAbiCoder.encode(BRIDGE_COMMAND, values);
  return raw === true ? value : keccak256(value);
}
