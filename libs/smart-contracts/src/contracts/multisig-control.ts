import { ethers } from 'ethers';
import abi from '../abis/multisig_abi.json';
import { calcGasBuffer } from '../utils';

export class MultisigControl {
  public contract: ethers.Contract;
  public address: string;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
    this.address = address;
  }

  async addSigner(newSigner: string, nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.add_signer(
      newSigner,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.addSigner(newSigner, nonce, signatures, { gasLimit });
  }

  async burnNonce(nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.burn_nonce(nonce, signatures);
    const gasLimit = calcGasBuffer(res);
    return this.contract.burnNonce(nonce, signatures, { gasLimit });
  }

  getCurrentThreshold() {
    return this.contract.get_current_threshold();
  }

  getValidSignerCount() {
    return this.contract.getValidSignerCount();
  }

  isNonceUsed(nonce: string) {
    return this.contract.isNonceUsed(nonce);
  }

  isValidSigner(signerAddress: string) {
    return this.contract.isValidSigner(signerAddress);
  }

  async removeSigner(oldSigner: string, nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.removeSigner(
      oldSigner,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.removeSigner(oldSigner, nonce, signatures, {
      gasLimit,
    });
  }

  async setThreshold(newThreshold: string, nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.setThreshold(
      newThreshold,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.setThreshold(newThreshold, nonce, signatures, {
      gasLimit,
    });
  }

  signers(address: string) {
    return this.contract.signers(address);
  }

  async verifySignatures(nonce: string, message: string, signatures: string) {
    const res = await this.contract.estimateGas.verifySignatures(
      nonce,
      message,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.verifySignatures(nonce, message, signatures, {
      gasLimit,
    });
  }
}
