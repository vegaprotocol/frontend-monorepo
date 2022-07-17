import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import abi from '../abis/erc20_bridge_abi.json';
import { prepend0x } from '../utils';

export class CollateralBridge {
  public contract: ethers.Contract;
  public isNewContract = false;
  public address: string;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
    this.address = address;
  }

  depositAsset(assetSource: string, amount: string, vegaPublicKey: string) {
    return this.contract.deposit_asset(
      assetSource,
      amount,
      prepend0x(vegaPublicKey)
    );
  }
  getAssetSource(vegaAssetId: string) {
    return this.contract.get_asset_source(vegaAssetId);
  }
  getDepositMaximum(assetSource: string): Promise<BigNumber> {
    return this.contract.get_deposit_maximum(assetSource);
  }
  getDepositMinimum(assetSource: string): Promise<BigNumber> {
    return this.contract.get_deposit_minimum(assetSource);
  }
  getMultisigControlAddres() {
    return this.contract.get_multisig_control_address();
  }
  getVegaAssetId(address: string) {
    return this.contract.get_vega_asset_id(address);
  }
  isAssetListed(address: string) {
    return this.contract.is_asset_listed(address);
  }
  getWithdrawThreshold(assetSource: string) {
    return this.contract.get_withdraw_threshold(assetSource);
  }
  withdrawAsset(
    assetSource: string,
    amount: string,
    target: string,
    nonce: string,
    signatures: string
  ) {
    return this.contract.withdraw_asset(
      assetSource,
      amount,
      target,
      nonce,
      signatures
    );
  }
}
