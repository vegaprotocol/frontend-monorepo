import type { SetState } from 'zustand';
import create from 'zustand';

interface GlobalStore {
  vegaWalletConnectDialog: boolean;
  setVegaWalletConnectDialog: (isOpen: boolean) => void;
  vegaWalletManageDialog: boolean;
  setVegaWalletManageDialog: (isOpen: boolean) => void;
  landingDialog: boolean;
  setLandingDialog: (isOpen: boolean) => void;
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
  landingDialog: false,
  setLandingDialog: (isOpen: boolean) => {
    set({ landingDialog: isOpen });
  },
}));
