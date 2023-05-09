import { ethers } from 'ethers';
import abi from '../abis/staking_abi.json';
import { calcGasBuffer, prepend0x } from '../utils';
import type { BigNumber as EthersBigNum } from 'ethers';

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
    const key = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.stake(amount, key);
    const gasLimit = calcGasBuffer(res);
    return this.contract.stake(amount, key, {
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

  async transfer_stake(
    amount: string,
    newAddress: string,
    vegaPublicKey: string
  ) {
    const key = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.transfer_stake(
      amount,
      newAddress,
      key
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.transfer_stake(amount, newAddress, key, {
      gasLimit,
    });
  }

  staking_token() {
    return this.contract.staking_token();
  }
  stake_balance(target: string, vegaPublicKey: string): Promise<EthersBigNum> {
    return this.contract.stake_balance(target, prepend0x(vegaPublicKey));
  }
  total_staked() {
    return this.contract.total_staked();
  }
}
