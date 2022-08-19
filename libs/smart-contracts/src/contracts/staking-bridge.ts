import { ethers } from 'ethers';
import abi from '../abis/staking_abi.json';
import { prepend0x } from '../utils';

export class StakingBridge {
  public contract: ethers.Contract;
  public address: string;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
    this.address = address;
  }

  stake(amount: string, vegaPublicKey: string) {
    return this.contract.stake(amount, prepend0x(vegaPublicKey));
  }
  remove_stake(amount: string, vegaPublicKey: string) {
    return this.contract.remove_stake(amount, prepend0x(vegaPublicKey));
  }
  transfer_stake(amount: string, newAddress: string, vegaPublicKey: string) {
    return this.contract.transfer_stake(
      amount,
      newAddress,
      prepend0x(vegaPublicKey)
    );
  }
  staking_token() {
    return this.contract.staking_token();
  }
  stake_balance(target: string, vegaPublicKey: string) {
    return this.contract.stake_balance(target, prepend0x(vegaPublicKey));
  }
  total_staked() {
    return this.contract.total_staked();
  }
}
