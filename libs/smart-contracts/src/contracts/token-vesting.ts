import { ethers } from 'ethers';
import abi from '../abis/vesting_abi.json';
import { calcGasBuffer, prepend0x } from '../utils';

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
  async stake_tokens(amount: string, vegaPublicKey: string) {
    const key = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.stake_tokens(amount, key);
    const gasLimit = calcGasBuffer(res);
    return this.contract.stake_tokens(amount, key, {
      gasLimit,
    });
  }
  async remove_stake(amount: string, vegaPublicKey: string) {
    const key = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.remove_stake(amount, key);
    const gasLimit = calcGasBuffer(res);
    return this.contract.remove_stake(amount, key, {
      gasLimit,
    });
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
  async withdraw_from_tranche(trancheId: number) {
    const res = await this.contract.estimateGas.withdraw_from_tranche(
      trancheId
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.withdraw_from_tranche(trancheId, {
      gasLimit,
    });
  }
}
