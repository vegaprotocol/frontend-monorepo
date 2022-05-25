import type { BigNumber as EthersBigNumber } from 'ethers';
import { ethers } from 'ethers';
import { EnvironmentConfig } from '../config/ethereum';
import type { Networks } from '../config/vega';

import erc20BridgeAbi from '../abis/erc20_bridge_abi.json';
import { BaseContract } from './base-contract';
import BigNumber from 'bignumber.js';
import { addDecimal } from '../utils';

export class VegaErc20Bridge extends BaseContract {
  private contract: ethers.Contract;

  constructor(
    network: Networks,
    provider: ethers.providers.Web3Provider,
    signer?: ethers.Signer
  ) {
    super(provider, signer);
    this.contract = new ethers.Contract(
      EnvironmentConfig[network].erc20Bridge,
      erc20BridgeAbi,
      this.signer || this.provider
    );
  }

  /** Executes contracts withdraw_asset function */
  async withdraw(
    approval: {
      assetSource: string;
      amount: string;
      nonce: string;
      signatures: string;
      targetAddress: string;
    },
    confirmations = 1
  ): Promise<ethers.ContractTransaction> {
    const tx = await this.contract.withdraw_asset(
      approval.assetSource,
      approval.amount, // No need to remove decimals as this value is already set and not manipulated by the user
      approval.targetAddress,
      approval.nonce,
      approval.signatures
    );

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  async depositAsset(
    assetSource: string,
    amount: string,
    vegaPublicKey: string,
    confirmations = 1
  ) {
    const tx = await this.contract.deposit_asset(
      assetSource,
      amount,
      vegaPublicKey
    );

    this.trackTransaction(tx, confirmations);

    return tx;
  }

  async getAssetSource(vegaAssetId: string): Promise<string> {
    const res = await this.contract.get_asset_source(vegaAssetId);
    return res;
  }

  async getDepositMaximum(
    assetSource: string,
    decimals: number
  ): Promise<BigNumber> {
    const res: EthersBigNumber = await this.contract.get_deposit_maximum(
      assetSource
    );
    const value = addDecimal(new BigNumber(res.toString()), decimals);
    return value;
  }

  async getDepositMinimum(
    assetSource: string,
    decimals: number
  ): Promise<BigNumber> {
    const res: EthersBigNumber = await this.contract.get_deposit_minimum(
      assetSource
    );
    const value = addDecimal(new BigNumber(res.toString()), decimals);
    return value;
  }

  async getMultisigControlAddress(): Promise<string> {
    const res = await this.contract.get_multisig_control_address();
    return res;
  }

  async getVegaAssetId(): Promise<string> {
    const res = await this.contract.get_vega_asset_id();
    return res;
  }

  async isAssetListed(assetSource: string): Promise<boolean> {
    const res = await this.contract.is_asset_listed(assetSource);
    return res;
  }
}
