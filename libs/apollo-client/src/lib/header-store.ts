import { create } from 'zustand';

interface HeaderStore {
  blockHeight: number;
  timestamp: Date;
}

export const useHeaderStore = create<HeaderStore>(() => ({
  blockHeight: 0,
  timestamp: new Date(),
}));
