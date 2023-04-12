import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import erc20Abi from '../abis/erc20_abi.json';
import { calcGasBuffer } from '../utils';

export class Token {
  public contract: ethers.Contract;
  public address: string;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, erc20Abi, signerOrProvider);
    this.address = address;
  }

  totalSupply() {
    return this.contract.totalSupply();
  }
  balanceOf(account: string): Promise<BigNumber> {
    return this.contract.balanceOf(account);
  }
  allowance(owner: string, spender: string): Promise<BigNumber> {
    return this.contract.allowance(owner, spender);
  }
  async approve(spender: string, amount: string) {
    const res = await this.contract.estimateGas.approve(spender, amount);
    const gasLimit = calcGasBuffer(res);
    return this.contract.approve(spender, amount, { gasLimit });
  }
  decimals(): Promise<number> {
    return this.contract.decimals();
  }
  async faucet() {
    /* No op */
  }
}
