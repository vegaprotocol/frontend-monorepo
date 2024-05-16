import { ethers } from 'ethers';
import abi from '../abis/arbitrum_squid_receiver_abi.json';

export class ArbitrumSquidReceiver {
  public contract: ethers.Contract;

  constructor(address: string) {
    this.contract = new ethers.Contract(address, abi);
  }

  async approve(token: string) {
    return this.contract.approve(token);
  }

  encodeApproveData(token: string) {
    const data = this.contract.interface.encodeFunctionData('approve', [token]);
    return data;
  }

  async deposit(
    asset: string,
    amount: string,
    vegaPubKey: string,
    recovery: string
  ) {
    return this.contract.deposit(asset, amount, vegaPubKey, recovery);
  }

  encodeDepositData(
    asset: string,
    amount: string,
    vegaPubKey: string,
    recovery: string
  ) {
    const data = this.contract.interface.encodeFunctionData('deposit', [
      asset,
      amount,
      vegaPubKey,
      recovery,
    ]);
    return data;
  }
}
