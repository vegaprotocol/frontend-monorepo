import { create } from 'zustand';

interface ProfileDialogStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useProfileDialogStore = create<ProfileDialogStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
