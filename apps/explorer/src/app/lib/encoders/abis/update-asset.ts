import { defaultAbiCoder, isAddress } from 'ethers/lib/utils';
import { encodeBridgeCommand } from './bridge-command';
import type { AbiType } from './abi-types';

export const METHOD_NAME = 'set_asset_limits';

export const LIST_ASSET_ABI: AbiType[] = [
  // Asset address
  'address',
  // Lifetime limit
  'uint256',
  // Withdraw threshold
  'uint256',
  // Nonce
  'uint256',
  // Contract method name
  'string',
];

export interface EncodeUpdateAssetParameters {
  // The ETH address of the ERC20 asset
  assetERC20: string;
  // The number as a string of the asset
  limit: string;
  // THe number-as-a-string of the withdraw threshold
  threshold: string;
  // The n-once supplied to the contract
  nonce: string;
}

/**
 * Generates an ABI encoded function call to list an asset
 *
 * @param EncodeListAssetParameters The arguments for the ABI call
 * @returns string   encoded message
 */
export function encodeUpdateAsset({
  assetERC20,
  limit,
  threshold,
  nonce,
}: EncodeUpdateAssetParameters) {
  if (!isAddress(assetERC20)) {
    throw new Error('Asset ERC20 must be a valid address');
  }

  const values = [assetERC20, limit, threshold, nonce, METHOD_NAME];

  return defaultAbiCoder.encode(LIST_ASSET_ABI, values);
}

/**
 * Convenience function that encodes and packs the message as it is encoded by the
 * validators in a multisig bundle
 *
 * @param params  Parameters for the List Asset call
 * @param bridgeAddress Bridge address for the appropiate network
 * @returns keccak256 encoded message digest
 */
export function encodeUpdateAssetBridgeTx(
  params: EncodeUpdateAssetParameters,
  bridgeAddress: string
) {
  return encodeBridgeCommand(encodeUpdateAsset(params), bridgeAddress);
}
