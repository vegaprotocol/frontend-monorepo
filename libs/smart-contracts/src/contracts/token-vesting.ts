import { ethers } from 'ethers';
import abi from '../abis/vesting_abi.json';
import { prepend0x } from '../utils';

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

  stake_tokens(amount: string, vegaPublicKey: string) {
    return this.contract.stake_tokens(amount, prepend0x(vegaPublicKey));
  }
  remove_stake(amount: string, vegaPublicKey: string) {
    return this.contract.remove_stake(amount, prepend0x(vegaPublicKey));
  }
  stake_balance(address: string, vegaPublicKey: string) {
    return this.contract.stake_balance(address, prepend0x(vegaPublicKey));
  }
  total_staked() {
    return this.contract.total_staked();
  }
  user_stats(address: string) {
    return this.contract.user_stats(address);
  }
  get_tranche_balance(address: string, trancheId: number) {
    return this.contract.get_tranche_balance(address, trancheId);
  }
  get_vested_for_tranche(address: string, trancheId: number) {
    return this.contract.get_vested_for_tranche(address, trancheId);
  }
  user_total_all_tranches(address: string) {
    return this.contract.user_total_all_tranches(address);
  }
  withdraw_from_tranche(trancheId: number) {
    return this.contract.withdraw_from_tranche(trancheId);
  }
}
