import { ethers } from 'ethers';
import abi from '../abis/staking_abi.json';

export const createStakingBridgeContract = (
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const contract = new ethers.Contract(address, abi, signerOrProvider);

  return {
    stake: (amount: string, vegaPublicKey: string) => {
      return contract.stake(amount, `0x${vegaPublicKey}`);
    },
    removeStake: (amount: string, vegaPublicKey: string) => {
      return contract.remove_stake(amount, `0x${vegaPublicKey}`);
    },
    transferStake: (
      amount: string,
      newAddress: string,
      vegaPublicKey: string
    ) => {
      return contract.transfer_stake(amount, newAddress, vegaPublicKey);
    },
    stakingToken: () => {
      return contract.staking_token();
    },
    stakeBalance: (target: string, vegaPublicKey: string) => {
      return contract.stake_balance(target, vegaPublicKey);
    },
    totalStaked: () => {
      return contract.total_staked();
    },
  };
};
