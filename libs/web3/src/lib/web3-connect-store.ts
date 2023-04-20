import { create } from 'zustand';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';

interface State {
  isOpen: boolean;
  connectors: [Connector, Web3ReactHooks][];
  desiredChainId?: number;
  error?: Error;
}
interface Actions {
  initialize: (connectors: State['connectors'], desiredChainId: number) => void;
  open: () => void;
  close: () => void;
  clearError: () => void;
}

export const useWeb3ConnectStore = create<State & Actions>()((set) => ({
  isOpen: false,
  connectors: [],
  initialize: (connectors, desiredChainId) => {
    set({ connectors, desiredChainId });
  },
  open: () => set(() => ({ isOpen: true })),
  close: () => set(() => ({ isOpen: false })),
  clearError: () => set(() => ({ error: undefined })),
}));
