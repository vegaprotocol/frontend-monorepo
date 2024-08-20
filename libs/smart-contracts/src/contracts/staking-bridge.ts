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

  async removeStake(amount: string, vegaPublicKey: string) {
    const key = prepend0x(vegaPublicKey);
    const res = await this.contract.estimateGas.removeStake(amount, key);
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
    const res = await this.contract.estimateGas.transferStake(
      amount,
      newAddress,
      key
    );
    const gasLimit = calcGasBuffer(res);
    return this.contract.transferStake(amount, newAddress, key, {
      gasLimit,
    });
  }

  stakingToken() {
    return this.contract.stakingToken();
  }
  stakeBalance(target: string, vegaPublicKey: string): Promise<EthersBigNum> {
    return this.contract.stakeBalance(target, prepend0x(vegaPublicKey));
  }
  totalStaked() {
    return this.contract.totalStaked();
  }
}
