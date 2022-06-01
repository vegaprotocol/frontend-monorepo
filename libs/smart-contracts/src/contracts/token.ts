import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import erc20Abi from '../abis/erc20_abi.json';
import erc20AbiFaucet from '../abis/erc20_abi_faucet.json';

export class Token {
  public contract: ethers.Contract;
  public faucetable: boolean;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider,
    faucetable = false
  ) {
    this.contract = new ethers.Contract(
      address,
      faucetable ? erc20AbiFaucet : erc20Abi,
      signerOrProvider
    );
    this.faucetable = faucetable;
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
  faucet() {
    if (!this.faucetable) {
      throw new Error('Cannot use faucet');
    }

    return this.contract.faucet();
  }
}
