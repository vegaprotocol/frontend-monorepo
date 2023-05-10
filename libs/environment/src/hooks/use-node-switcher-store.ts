import { create } from 'zustand';

export const useNodeSwitcherStore = create<{
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}>()((set) => ({
  dialogOpen: false,
  setDialogOpen: (isOpen) => {
    set({ dialogOpen: isOpen });
  },
}));
