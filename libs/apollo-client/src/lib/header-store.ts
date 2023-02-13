import { create } from 'zustand';

export interface HeaderEntry {
  blockHeight: number;
  timestamp: Date;
}

type HeaderStore = {
  [url: string]: HeaderEntry;
};

export const useHeaderStore = create<HeaderStore>(() => ({}));
