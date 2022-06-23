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
  removeStake(amount: string, vegaPublicKey: string) {
    return this.contract.remove_stake(amount, prepend0x(vegaPublicKey));
  }
  transferStake(amount: string, newAddress: string, vegaPublicKey: string) {
    return this.contract.transfer_stake(
      amount,
      newAddress,
      prepend0x(vegaPublicKey)
    );
  }
  stakingToken() {
    return this.contract.staking_token();
  }
  stakeBalance(target: string, vegaPublicKey: string) {
    return this.contract.stake_balance(target, prepend0x(vegaPublicKey));
  }
  totalStaked() {
    return this.contract.total_staked();
  }
}
