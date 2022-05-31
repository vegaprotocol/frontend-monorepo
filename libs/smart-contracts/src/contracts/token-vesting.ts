import { ethers } from 'ethers';
import abi from '../abis/vesting_abi.json';

export const createTokenVestingContract = (
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const contract = new ethers.Contract(address, abi, signerOrProvider);

  return {
    contract,
    stakeTokens: (amount: string, vegaPublicKey: string) => {
      return contract.stake_tokens(amount, vegaPublicKey);
    },
    removeStake: (amount: string, vegaPublicKey: string) => {
      return contract.remove_stake(amount, vegaPublicKey);
    },
    stakeBalance: (address: string, vegaPublicKey: string) => {
      return contract.stake_balance(address, vegaPublicKey);
    },
    totalStaked: () => {
      return contract.total_staked();
    },
    userStats: (address: string) => {
      return contract.user_stats(address);
    },
    getTrancheBalance: (address: string, trancheId: number) => {
      return contract.get_tranche_balance(address, trancheId);
    },
    getVestedForTranche: (address: string, trancheId: number) => {
      return contract.get_vested_for_tranche(address, trancheId);
    },
    userTotalAllTranches: (address: string) => {
      return contract.user_total_all_tranches(address);
    },
    withdrawFromTranche: (trancheId: number) => {
      return contract.withdraw_from_tranche(trancheId);
    },
  };
};
