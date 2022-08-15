import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import abi from '../abis/erc20_bridge_new_abi.json';

export class CollateralBridgeNew {
  public contract: ethers.Contract;
  public isNewContract = true;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
  }

  deposit_asset(assetSource: string, amount: string, vegaPublicKey: string) {
    return this.contract.deposit_asset(assetSource, amount, vegaPublicKey);
  }
  get_asset_source(vegaAssetId: string) {
    return this.contract.get_asset_source(vegaAssetId);
  }
  get_deposit_maximum(assetSource: string): Promise<BigNumber> {
    return this.contract.get_asset_deposit_lifetime_limit(assetSource);
  }
  get_multisig_control_address() {
    return this.contract.get_multisig_control_address();
  }
  get_vega_asset_id(address: string) {
    return this.contract.get_vega_asset_id(address);
  }
  is_asset_listed(address: string) {
    return this.contract.is_asset_listed(address);
  }
  get_withdraw_threshold(assetSource: string) {
    return this.contract.get_withdraw_threshold(assetSource);
  }
  withdraw_asset(
    assetSource: string,
    amount: string,
    target: string,
    creation: string,
    nonce: string,
    signatures: string
  ) {
    return this.contract.withdraw_asset(
      assetSource,
      amount,
      target,
      creation,
      nonce,
      signatures
    );
  }
}
