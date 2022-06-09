import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import erc20Abi from '../abis/erc20_abi.json';

export class Token {
  public contract: ethers.Contract;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(address, erc20Abi, signerOrProvider);
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
  approve(spender: string, amount: string) {
    return this.contract.approve(spender, amount);
  }
  decimals(): Promise<number> {
    return this.contract.decimals();
  }
}
