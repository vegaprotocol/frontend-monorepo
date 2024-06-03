import type { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import erc20Abi from '../abis/erc20_abi.json';
import erc20AbiTether from '../abis/erc20_abi_tether.json';
import { calcGasBuffer } from '../utils';

const TETHER_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

export class Token {
  public contract: ethers.Contract;
  public address: string;

  constructor(
    address: string,
    signerOrProvider?: ethers.Signer | ethers.providers.Provider
  ) {
    let abi: typeof erc20Abi | typeof erc20AbiTether = erc20Abi;
    // USDT (Tether) has a different ABI
    if (address === TETHER_ADDRESS) {
      abi = erc20AbiTether;
    }

    this.contract = new ethers.Contract(address, abi, signerOrProvider);
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

  encodeApproveData(spender: string, amount: string) {
    const data = this.contract.interface.encodeFunctionData('approve', [
      spender,
      amount,
    ]);
    return data;
  }
  decimals(): Promise<number> {
    return this.contract.decimals();
  }
  async faucet() {
    const res = await this.contract.estimateGas.faucet();
    const gasLimit = calcGasBuffer(res);
    return this.contract.faucet({ gasLimit });
  }
}
