import { ethers, BigNumber } from 'ethers';
import abi from '../abis/multisig_abi.json';

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

  add_signer(newSigner: string, nonce: string, signatures: string) {
    return this.contract.add_signer(
      newSigner,
      BigNumber.from(nonce),
      signatures
    );
  }

  burn_nonce(nonce: string, signatures: string) {
    return this.contract.burn_nonce(BigNumber.from(nonce), signatures);
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

  remove_signer(oldSigner: string, nonce: string, signatures: string) {
    return this.contract.remove_signer(
      oldSigner,
      BigNumber.from(nonce),
      signatures
    );
  }

  set_threshold(newThreshold: string, nonce: string, signatures: string) {
    return this.contract.set_threshold(
      newThreshold,
      BigNumber.from(nonce),
      signatures
    );
  }

  signers(address: string) {
    return this.contract.signers(address);
  }

  verify_signatures(nonce: string, message: string, signatures: string) {
    return this.contract.verify_signatures(
      BigNumber.from(nonce),
      message,
      signatures
    );
  }
}
