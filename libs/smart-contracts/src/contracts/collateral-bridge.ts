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
  defaultWithdrawDelay() {
    return this.contract.defaultWithdrawDelay();
  }

  erc20AssetPoolAddress() {
    return this.contract.erc20AssetPoolAddress();
  }

  getAssetDepositLifetimeLimit(assetSource: string) {
    return this.contract.getAssetDepositLifetimeLimit(assetSource);
  }

  getAssetSource(vegaAssetId: string) {
    return this.contract.getAssetSource(vegaAssetId);
  }

  getMultisigControlAddress() {
    return this.contract.getMultisigControlAddress();
  }

  getVegaAssetId(assetSource: string) {
    return this.contract.getVegaAssetId(assetSource);
  }

  getWithdrawThreshold(assetSource: string): Promise<BigNumber> {
    return this.contract.getWithdrawThreshold(assetSource);
  }

  isAssetListed(assetSource: string) {
    return this.contract.isAssetListed(assetSource);
  }

  isExemptDepositor(depositor: string): Promise<boolean> {
    return this.contract.isExemptDepositor(depositor);
  }

  isStopped() {
    return this.contract.isStopped();
  }

  /* WRITE CONTRACT */
  async depositAsset(
    assetSource: string,
    amount: string,
    vegaPublicKey: string
  ) {
    const res = await this.contract.estimateGas.depositAsset(
      assetSource,
      amount,
      vegaPublicKey
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.depositAsset(assetSource, amount, vegaPublicKey, {
      gasLimit,
    });
  }

  encodeDepositData(
    assetSource: string,
    amount: string,
    vegaPublicKey: string
  ) {
    return this.contract.interface.encodeFunctionData('depositAsset', [
      assetSource,
      amount,
      vegaPublicKey,
    ]);
  }

  async listAsset(
    assetSource: string,
    vegaAssetId: string,
    lifetimeLimit: string,
    withdrawThreshold: string,
    nonce: string,
    signatures: string
  ) {
    const res = await this.contract.estimateGas.listAsset(
      assetSource,
      vegaAssetId,
      lifetimeLimit,
      withdrawThreshold,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.listAsset(
      assetSource,
      vegaAssetId,
      lifetimeLimit,
      withdrawThreshold,
      nonce,
      signatures,
      { gasLimit }
    );
  }
  async withdrawAsset(
    assetSource: string,
    amount: string,
    target: string,
    creation: string,
    nonce: string,
    signatures: string
  ) {
    const res = await this.contract.estimateGas.withdrawAsset(
      assetSource,
      amount,
      target,
      creation,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.withdrawAsset(
      assetSource,
      amount,
      target,
      creation,
      nonce,
      signatures,
      { gasLimit }
    );
  }
}
