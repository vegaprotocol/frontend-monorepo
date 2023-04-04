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

  async add_signer(newSigner: string, nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.add_signer(
      newSigner,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.add_signer(newSigner, nonce, signatures, { gasLimit });
  }

  async burn_nonce(nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.burn_nonce(nonce, signatures);
    const gasLimit = calcGasBuffer(res);
    return this.contract.burn_nonce(nonce, signatures, { gasLimit });
  }

  get_current_threshold() {
    return this.contract.get_current_threshold();
  }

  get_valid_signer_count() {
    return this.contract.get_valid_signer_count();
  }

  is_nonce_used(nonce: string) {
    return this.contract.is_nonce_used(nonce);
  }

  is_valid_signer(signerAddress: string) {
    return this.contract.is_valid_signer(signerAddress);
  }

  async remove_signer(oldSigner: string, nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.remove_signer(
      oldSigner,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.remove_signer(oldSigner, nonce, signatures, {
      gasLimit,
    });
  }

  async set_threshold(newThreshold: string, nonce: string, signatures: string) {
    const res = await this.contract.estimateGas.set_threshold(
      newThreshold,
      nonce,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.set_threshold(newThreshold, nonce, signatures, {
      gasLimit,
    });
  }

  signers(address: string) {
    return this.contract.signers(address);
  }

  async verify_signatures(nonce: string, message: string, signatures: string) {
    const res = await this.contract.estimateGas.verify_signatures(
      nonce,
      message,
      signatures
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.verify_signatures(nonce, message, signatures, {
      gasLimit,
    });
  }
}
