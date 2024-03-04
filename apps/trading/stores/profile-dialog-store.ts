import { create } from 'zustand';

interface ProfileDialogStore {
  open: boolean;
  pubKey: string | undefined;
  setOpen: (pubKey: string | undefined) => void;
}

export const useProfileDialogStore = create<ProfileDialogStore>((set) => ({
  open: false,
  pubKey: undefined,
  setOpen: (pubKey) => {
    if (pubKey) {
      set({ open: true, pubKey });
    } else {
      set({ open: false, pubKey: undefined });
    }
  },
}));
