import { create } from 'zustand';

export interface VegaWalletDialogStore {
  vegaWalletDialogOpen: boolean;
  updateVegaWalletDialog: (open: boolean) => void;
  openVegaWalletDialog: () => void;
  closeVegaWalletDialog: () => void;
}

export const useVegaWalletDialogStore = create<VegaWalletDialogStore>()(
  (set) => ({
    vegaWalletDialogOpen: false,
    updateVegaWalletDialog: (open: boolean) =>
      set({ vegaWalletDialogOpen: open }),
    openVegaWalletDialog: () => set({ vegaWalletDialogOpen: true }),
    closeVegaWalletDialog: () => set({ vegaWalletDialogOpen: false }),
  })
);
