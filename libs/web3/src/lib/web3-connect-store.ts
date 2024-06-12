import { create } from 'zustand';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';

interface State {
  isOpen: boolean;
  connectors: [Connector, Web3ReactHooks][];
  desiredChainId?: number;
  error?: Error;
  chains?: number[];
}
interface Actions {
  initialize: (connectors: State['connectors'], chains: number[]) => void;
  open: (desiredChainId?: number) => void;
  close: () => void;
  clearError: () => void;
}

export const useWeb3ConnectStore = create<State & Actions>()((set) => ({
  isOpen: false,
  connectors: [],
  initialize: (connectors, chains) => {
    set({ connectors, desiredChainId: chains[0] || undefined, chains });
  },
  open: (desiredChainId = 1) => set(() => ({ isOpen: true, desiredChainId })),
  close: () => set(() => ({ isOpen: false })),
  clearError: () => set(() => ({ error: undefined })),
}));
