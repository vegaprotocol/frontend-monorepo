import { defaultAbiCoder, isAddress, isHexString } from 'ethers/lib/utils';
import { encodeBridgeCommand } from './bridge-command';
import type { AbiType } from './abi-types';

export const METHOD_NAME = 'list_asset';

export const LIST_ASSET_ABI: AbiType[] = [
  // Asset address
  'address',
  // Asset ID on Vega
  'bytes32',
  // Lifetime limit
  'uint256',
  // Withdraw threshold
  'uint256',
  // Nonce
  'uint256',
  // Contract method name
  'string',
];

export interface EncodeListAssetParameters {
  // The ETH address of the ERC20 asset
  assetERC20: string;
  // The Vega ID of the asset, 0x prefixed
  assetId: string;
  // The number as a string of the asset
  limit: string;
  // THe number-as-a-string of the withdraw threshold
  threshold: string;
  // The n-once supplied to the contract
  nonce: string;
}

/**
 * Generates an ABI encoded function call to list an asset. This is
 * used in the Signature Bundle view on some proposals to recover
 * which validators signed a multisig bundle. It does this by recovering
 * the ERC20 addresses of the signers, then comparing those to the list
 * of signers on the bundle. In order to do this, we recreate the signed
 * data from the values we know from the transaction. That last part
 * is what this function does.
 *
 * @param EncodeListAssetParameters The arguments for the ABI call
 * @returns string   encoded message
 */
export function encodeListAsset({
  assetERC20,
  assetId,
  limit,
  threshold,
  nonce,
}: EncodeListAssetParameters) {
  if (!isAddress(assetERC20) || !isHexString(assetId)) {
    throw new Error('Asset ERC20 and assetID must be hex values');
  }

  const values = [assetERC20, assetId, limit, threshold, nonce, METHOD_NAME];

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
export function encodeListAssetBridgeTx(
  params: EncodeListAssetParameters,
  bridgeAddress: string
) {
  return encodeBridgeCommand(encodeListAsset(params), bridgeAddress);
}
