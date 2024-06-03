import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import abi from '../abis/erc20_bridge_abi.json';
import { calcGasBuffer } from '../utils';

export class CollateralBridge {
  public contract: ethers.Contract;
  public isNewContract = true;

  constructor(
    address: string,
    signerOrProvider?: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
  }

  async deposit_asset(
    assetSource: string,
    amount: string,
    vegaPublicKey: string
  ) {
    const res = await this.contract.estimateGas.deposit_asset(
      assetSource,
      amount,
      vegaPublicKey
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.deposit_asset(assetSource, amount, vegaPublicKey, {
      gasLimit,
    });
  }

  encodeDepositData(token: string, amount: string, vegaPubKey: string) {
    return this.contract.interface.encodeFunctionData('deposit_asset', [
      token,
      amount,
      vegaPubKey,
    ]);
  }

  get_asset_source(vegaAssetId: string) {
    return this.contract.get_asset_source(vegaAssetId);
  }
  get_deposit_maximum(assetSource: string): Promise<BigNumber> {
    return this.contract.get_asset_deposit_lifetime_limit(assetSource);
  }
  is_exempt_depositor(address: string): Promise<boolean> {
    return this.contract.is_exempt_depositor(address);
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
  get_withdraw_threshold(assetSource: string): Promise<BigNumber> {
    return this.contract.get_withdraw_threshold(assetSource);
  }
  default_withdraw_delay() {
    return this.contract.default_withdraw_delay();
  }
  async list_asset(
    address: string,
    vegaAssetId: string,
    lifetimeLimit: string,
    withdraw_threshold: string,
    nonce: string,
    signatures: string
  ) {
    const res = await this.contract.estimateGas.list_asset(
      address,
      vegaAssetId,
      lifetimeLimit,
      withdraw_threshold,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.list_asset(
      address,
      vegaAssetId,
      lifetimeLimit,
      withdraw_threshold,
      nonce,
      signatures,
      {
        gasLimit,
      }
    );
  }
  async withdraw_asset(
    assetSource: string,
    amount: string,
    target: string,
    creation: string,
    nonce: string,
    signatures: string
  ) {
    const res = await this.contract.estimateGas.withdraw_asset(
      assetSource,
      amount,
      target,
      creation,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.withdraw_asset(
      assetSource,
      amount,
      target,
      creation,
      nonce,
      signatures,
      {
        gasLimit,
      }
    );
  }

  is_stopped() {
    return this.contract.is_stopped();
  }

  get_erc20_asset_pool_address() {
    return this.contract.erc20_asset_pool_address();
  }
}
