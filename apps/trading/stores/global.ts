import type { SetState } from 'zustand';
import create from 'zustand';

interface GlobalStore {
  vegaWalletConnectDialog: boolean;
  setVegaWalletConnectDialog: (isOpen: boolean) => void;
  vegaWalletManageDialog: boolean;
  setVegaWalletManageDialog: (isOpen: boolean) => void;
  vegaNetworkSwitcherDialog: boolean;
  setVegaNetworkSwitcherDialog: (isOpen: boolean) => void;
  landingDialog: boolean;
  setLandingDialog: (isOpen: boolean) => void;
  marketId: string | null;
  setMarketId: (marketId: string) => void;
}

export const useGlobalStore = create((set: SetState<GlobalStore>) => ({
  vegaWalletConnectDialog: false,
  setVegaWalletConnectDialog: (isOpen: boolean) => {
    set({ vegaWalletConnectDialog: isOpen });
  },
  vegaWalletManageDialog: false,
  setVegaWalletManageDialog: (isOpen: boolean) => {
    set({ vegaWalletManageDialog: isOpen });
  },
  vegaNetworkSwitcherDialog: false,
  setVegaNetworkSwitcherDialog: (isOpen: boolean) => {
    set({ vegaNetworkSwitcherDialog: isOpen });
  },
  landingDialog: false,
  setLandingDialog: (isOpen: boolean) => {
    set({ landingDialog: isOpen });
  },
  marketId: null,
  setMarketId: (id: string) => {
    set({ marketId: id });
  },
}));
