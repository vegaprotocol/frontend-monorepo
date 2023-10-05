import { create } from 'zustand';
interface State {
  isOpen: boolean;
  assetId?: string;
}

interface Actions {
  open: (assetId?: string) => void;
  close: () => void;
}

export const useWithdrawalDialog = create<State & Actions>()((set) => ({
  isOpen: false,
  assetId: undefined,
  open: (assetId) => set(() => ({ assetId, isOpen: true })),
  close: () => set(() => ({ assetId: undefined, isOpen: false })),
}));
