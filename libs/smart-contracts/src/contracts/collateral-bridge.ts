import { type BigNumber, ethers } from 'ethers';
import abi from '../abis/erc20_bridge_abi.json';
import { calcGasBuffer } from '../utils';

export class CollateralBridge {
  public contract: ethers.Contract;

  constructor(
    address: string,
    signerOrProvider?: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
  }

  /* READ CONTRACT */
  default_withdraw_delay() {
    return this.contract.default_withdraw_delay();
  }

  erc20_asset_pool_address() {
    return this.contract.erc20_asset_pool_address();
  }

  get_asset_deposit_lifetime_limit(asset_source: string) {
    return this.contract.get_asset_deposit_lifetime_limit(asset_source);
  }

  get_asset_source(vega_asset_id: string) {
    return this.contract.get_asset_source(vega_asset_id);
  }

  get_multisig_control_address() {
    return this.contract.get_multisig_control_address();
  }

  get_vega_asset_id(asset_source: string) {
    return this.contract.get_vega_asset_id(asset_source);
  }

  get_withdraw_threshold(asset_source: string): Promise<BigNumber> {
    return this.contract.get_withdraw_threshold(asset_source);
  }

  is_asset_listed(asset_source: string) {
    return this.contract.is_asset_listed(asset_source);
  }

  is_exempt_depositor(depositor: string): Promise<boolean> {
    return this.contract.is_exempt_depositor(depositor);
  }

  is_stopped() {
    return this.contract.is_stopped();
  }

  /* WRITE CONTRACT */
  async deposit_asset(
    asset_source: string,
    amount: string,
    vega_public_key: string
  ) {
    const res = await this.contract.estimateGas.deposit_asset(
      asset_source,
      amount,
      vega_public_key
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.deposit_asset(asset_source, amount, vega_public_key, {
      gasLimit,
    });
  }

  encodeDepositData(
    asset_source: string,
    amount: string,
    vega_public_key: string
  ) {
    return this.contract.interface.encodeFunctionData('deposit_asset', [
      asset_source,
      amount,
      vega_public_key,
    ]);
  }

  async list_asset(
    asset_source: string,
    vega_asset_id: string,
    lifetime_limit: string,
    withdraw_threshold: string,
    nonce: string,
    signatures: string
  ) {
    const res = await this.contract.estimateGas.list_asset(
      asset_source,
      vega_asset_id,
      lifetime_limit,
      withdraw_threshold,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.list_asset(
      asset_source,
      vega_asset_id,
      lifetime_limit,
      withdraw_threshold,
      nonce,
      signatures,
      { gasLimit }
    );
  }
  async withdraw_asset(
    asset_source: string,
    amount: string,
    target: string,
    creation: string,
    nonce: string,
    signatures: string
  ) {
    const res = await this.contract.estimateGas.withdraw_asset(
      asset_source,
      amount,
      target,
      creation,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.withdraw_asset(
      asset_source,
      amount,
      target,
      creation,
      nonce,
      signatures,
      { gasLimit }
    );
  }
}
