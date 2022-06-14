import { ethers } from 'ethers';
import abi from '../abis/vesting_abi.json';

export class TokenVesting {
  public contract: ethers.Contract;
  public address: string;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
    this.address = address;
  }

  stakeTokens(amount: string, vegaPublicKey: string) {
    return this.contract.stake_tokens(amount, vegaPublicKey);
  }
  removeStake(amount: string, vegaPublicKey: string) {
    return this.contract.remove_stake(amount, vegaPublicKey);
  }
  stakeBalance(address: string, vegaPublicKey: string) {
    return this.contract.stake_balance(address, vegaPublicKey);
  }
  totalStaked() {
    return this.contract.total_staked();
  }
  userStats(address: string) {
    return this.contract.user_stats(address);
  }
  getTrancheBalance(address: string, trancheId: number) {
    return this.contract.get_tranche_balance(address, trancheId);
  }
  getVestedForTranche(address: string, trancheId: number) {
    return this.contract.get_vested_for_tranche(address, trancheId);
  }
  userTotalAllTranches(address: string) {
    return this.contract.user_total_all_tranches(address);
  }
  withdrawFromTranche(trancheId: number) {
    return this.contract.withdraw_from_tranche(trancheId);
  }
}
