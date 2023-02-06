import { create } from 'zustand';

type HeaderStore = {
  [url: string]: {
    blockHeight: number;
    timestamp: Date;
  };
};

export const useHeaderStore = create<HeaderStore>(() => ({}));
