import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import abi from '../abis/erc20_bridge_abi.json';

export const createCollateralBridgeContract = (
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const contract = new ethers.Contract(address, abi, signerOrProvider);

  return {
    depositAsset: (
      assetSource: string,
      amount: string,
      vegaPublicKey: string
    ) => {
      return contract.deposit_asset(assetSource, amount, vegaPublicKey);
    },
    getAssetSource: (vegaAssetId: string) => {
      return contract.get_asset_source(vegaAssetId);
    },
    getDepositMaximum: (assetSource: string): Promise<BigNumber> => {
      return contract.get_deposit_maximum(assetSource);
    },
    getDepositMinimum: (assetSource: string): Promise<BigNumber> => {
      return contract.get_deposit_minimum(assetSource);
    },
    getMultisigControlAddres: () => {
      return contract.get_multisig_control_address();
    },
    getVegaAssetId: (address: string) => {
      return contract.get_vega_asset_id(address);
    },
    isAssetListed: (address: string) => {
      return contract.is_asset_listed(address);
    },
    withdrawAsset: (
      assetSource: string,
      amount: string,
      target: string,
      nonce: string,
      signatures: string
    ) => {
      return contract.withdraw_asset(
        assetSource,
        amount,
        target,
        nonce,
        signatures
      );
    },
  };
};
