import { create } from 'zustand';

interface State {
  isOpen: boolean;
}
interface Actions {
  open: () => void;
  close: () => void;
}

export const useWeb3ConnectStore = create<State & Actions>()((set) => ({
  isOpen: false,
  open: () => set(() => ({ isOpen: true })),
  close: () => set(() => ({ isOpen: false })),
}));
