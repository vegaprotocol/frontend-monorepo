import { ethers } from 'ethers';
import abi from '../abis/vesting_abi.json';

export const createTokenVestingContract = (
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const contract = new ethers.Contract(address, abi, signerOrProvider);

  return {
    // accuracyScale: () => {},
    // addressMigration: () => {},
    // assistedWithdrawFromTranche: () => {},
    // controller: () => {},
    // createTranche: () => {},
    // defaultTrancheId: () => {},
    getTrancheBalance: (user: string, trancheId: number) => {
      contract.get_tranche_balance(user, trancheId);
    },
  };
};
