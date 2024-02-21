import { create } from 'zustand';

export interface DialogStore {
  isOpen: boolean;
  set: (open: boolean) => void;
  open: () => void;
  close: () => void;
}

export const useDialogStore = create<DialogStore>()((set) => ({
  isOpen: false,
  set: (open: boolean) => set({ isOpen: open }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
