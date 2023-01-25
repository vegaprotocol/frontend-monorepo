import BigNumber from 'bignumber.js';
import { create } from 'zustand';
import type { UserTrancheBalance } from '../../contexts/app-state/app-state-context';

export interface AssociationBreakdown {
  stakingAssociations: { [vegaKey: string]: BigNumber };
  vestingAssociations: { [vegaKey: string]: BigNumber };
}

export type BalancesStore = {
  associationBreakdown: AssociationBreakdown;
  allowance: BigNumber;
  balanceFormatted: BigNumber;
  totalVestedBalance: BigNumber;
  totalLockedBalance: BigNumber;
  walletBalance: BigNumber;
  trancheBalances: UserTrancheBalance[];
  lien: BigNumber;
  walletAssociatedBalance: BigNumber;
  vestingAssociatedBalance: BigNumber;
  updateBalances: (balances: Partial<RefreshBalances>) => void;
  setAllowance: (allowance: BigNumber) => void;
  setAssociationBreakdown: (associationBreakdown: AssociationBreakdown) => void;
  setTranchesBalances: (trancheBalances: UserTrancheBalance[]) => void;
};

export interface RefreshBalances {
  balanceFormatted: BigNumber;
  walletBalance: BigNumber;
  allowance: BigNumber;
  lien: BigNumber;
  walletAssociatedBalance: BigNumber;
  vestingAssociatedBalance: BigNumber;
}

export const useBalances = create<BalancesStore>((set) => ({
  associationBreakdown: {
    stakingAssociations: {},
    vestingAssociations: {},
  },
  trancheBalances: [],
  allowance: new BigNumber(0),
  totalVestedBalance: new BigNumber(0),
  totalLockedBalance: new BigNumber(0),
  balanceFormatted: new BigNumber(0),
  walletBalance: new BigNumber(0),
  lien: new BigNumber(0),
  walletAssociatedBalance: new BigNumber(0),
  vestingAssociatedBalance: new BigNumber(0),
  updateBalances: (balances: Partial<RefreshBalances>) =>
    set({
      ...balances,
    }),
  setAllowance: (allowance: BigNumber) => set({ allowance }),
  setAssociationBreakdown: (associationBreakdown: AssociationBreakdown) =>
    set({ associationBreakdown }),
  setTranchesBalances: (trancheBalances: UserTrancheBalance[]) =>
    set({
      trancheBalances,
      totalLockedBalance: BigNumber.sum.apply(null, [
        new BigNumber(0),
        ...trancheBalances.map((b) => b.locked),
      ]),
      totalVestedBalance: BigNumber.sum.apply(null, [
        new BigNumber(0),
        ...trancheBalances.map((b) => b.vested),
      ]),
    }),
}));
