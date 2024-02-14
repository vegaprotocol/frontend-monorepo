import { create } from 'zustand';

export interface DialogStore {
  vegaWalletDialogOpen: boolean;
  updateVegaWalletDialog: (open: boolean) => void;
  openVegaWalletDialog: () => void;
  closeVegaWalletDialog: () => void;
}

export const useDialogStore = create<DialogStore>()((set) => ({
  vegaWalletDialogOpen: false,
  updateVegaWalletDialog: (open: boolean) =>
    set({ vegaWalletDialogOpen: open }),
  openVegaWalletDialog: () => set({ vegaWalletDialogOpen: true }),
  closeVegaWalletDialog: () => set({ vegaWalletDialogOpen: false }),
}));
