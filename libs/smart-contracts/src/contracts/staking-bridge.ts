import { ethers } from 'ethers';
import abi from '../abis/staking_abi.json';

export class StakingBridge {
  public contract: ethers.Contract;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
  }

  stake(amount: string, vegaPublicKey: string) {
    return this.contract.stake(amount, `0x${vegaPublicKey}`);
  }
  removeStake(amount: string, vegaPublicKey: string) {
    return this.contract.remove_stake(amount, `0x${vegaPublicKey}`);
  }
  transferStake(amount: string, newAddress: string, vegaPublicKey: string) {
    return this.contract.transfer_stake(amount, newAddress, vegaPublicKey);
  }
  stakingToken() {
    return this.contract.staking_token();
  }
  stakeBalance(target: string, vegaPublicKey: string) {
    return this.contract.stake_balance(target, vegaPublicKey);
  }
  totalStaked() {
    return this.contract.total_staked();
  }
}
