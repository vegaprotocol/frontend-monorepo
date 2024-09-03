import BigNumber from 'bignumber.js';
import { create } from 'zustand';

export interface AssociationBreakdown {
  stakingAssociations: { [vegaKey: string]: BigNumber };
}

export type BalancesStore = {
  associationBreakdown: AssociationBreakdown;
  allowance: BigNumber;
  balanceFormatted: BigNumber;
  walletBalance: BigNumber;
  walletAssociatedBalance: BigNumber;
  updateBalances: (balances: Partial<RefreshBalances>) => void;
  setAllowance: (allowance: BigNumber) => void;
  setAssociationBreakdown: (associationBreakdown: AssociationBreakdown) => void;
};

export interface RefreshBalances {
  balanceFormatted: BigNumber;
  walletBalance: BigNumber;
  allowance: BigNumber;
  walletAssociatedBalance: BigNumber;
}

export const useBalances = create<BalancesStore>()((set) => ({
  associationBreakdown: {
    stakingAssociations: {},
  },
  allowance: new BigNumber(0),
  trancheBalances: [],
  balanceFormatted: new BigNumber(0),
  walletBalance: new BigNumber(0),
  walletAssociatedBalance: new BigNumber(0),
  updateBalances: (balances: Partial<RefreshBalances>) =>
    set({
      ...balances,
    }),
  setAllowance: (allowance: BigNumber) => set({ allowance }),
  setAssociationBreakdown: (associationBreakdown: AssociationBreakdown) =>
    set({ associationBreakdown }),
}));
