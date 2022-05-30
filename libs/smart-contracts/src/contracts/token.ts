import type { BigNumber} from 'ethers';
import { ethers } from 'ethers';
import erc20Abi from '../abis/erc20_abi.json';
import erc20AbiFaucet from '../abis/erc20_abi_faucet.json';

export const createTokenContract = (
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider,
  faucetable = false
) => {
  const contract = new ethers.Contract(
    address,
    faucetable ? erc20AbiFaucet : erc20Abi,
    signerOrProvider
  );

  return {
    address,

    totalSupply: () => {
      return contract.totalSupply();
    },
    balanceOf: (account: string): Promise<BigNumber> => {
      return contract.balanceOf(account);
    },
    allowance: (owner: string, spender: string): Promise<BigNumber> => {
      return contract.allowance(owner, spender);
    },
    approve: (spender: string, amount: string) => {
      return contract.approve(spender, amount);
    },
    decimals: (): Promise<number> => {
      return contract.decimals();
    },
    faucet: () => {
      if (!faucetable) {
        throw new Error('Cannot use faucet');
      }

      return contract.faucet();
    },

    // transfer
    // transferFrom
  };
};
