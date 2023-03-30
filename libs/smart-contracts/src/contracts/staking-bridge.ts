import { ethers } from 'ethers';
import abi from '../abis/staking_abi.json';
import { calcGasBuffer, prepend0x } from '../utils';

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

  async stake(amount: string, vegaPublicKey: string) {
    const spender = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.stake(amount, spender);
    const gasLimit = calcGasBuffer(res);
    return this.contract.stake(amount, spender, {
      gasLimit,
    });
  }
  async remove_stake(amount: string, vegaPublicKey: string) {
    const spender = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.remove_stake(amount, spender);
    const gasLimit = calcGasBuffer(res);
    return this.contract.remove_stake(amount, spender, {
      gasLimit,
    });
  }
  async transfer_stake(
    amount: string,
    newAddress: string,
    vegaPublicKey: string
  ) {
    const pubkey = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.transfer_stake(
      amount,
      newAddress,
      pubkey
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.transfer_stake(amount, newAddress, pubkey, {
      gasLimit,
    });
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
