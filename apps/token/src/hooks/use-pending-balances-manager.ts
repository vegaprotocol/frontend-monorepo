import type { Event } from 'ethers';
import uniqBy from 'lodash/uniqBy';

import create from 'zustand';

export type EthereumStore = {
  pendingBalances: Event[];
  addPendingTxs: (event: Event[]) => void;
  removePendingTx: (event: Event) => void;
  resetPendingTxs: () => void;
};

export const usePendingBalancesStore = create<EthereumStore>((set, get) => ({
  pendingBalances: [],
  addPendingTxs: (event: Event[]) => {
    set({
      pendingBalances: uniqBy(
        [...get().pendingBalances, ...event],
        'transactionHash'
      ),
    });
  },
  removePendingTx: (event: Event) => {
    set({
      pendingBalances: [
        ...get().pendingBalances.filter(
          ({ transactionHash }) => transactionHash !== event.transactionHash
        ),
      ],
    });
  },
  resetPendingTxs: () => {
    set({ pendingBalances: [] });
  },
}));
