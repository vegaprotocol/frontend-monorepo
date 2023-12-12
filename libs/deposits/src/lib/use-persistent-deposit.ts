import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const STORAGE_KEY = 'vega_deposit_store';
interface PersistedDeposit {
  assetId: string;
  amount?: string;
}
type PersistedDepositData = Record<string, PersistedDeposit>;

export const usePersistentDepositStore = create<{
  deposits: PersistedDepositData;
  saveValue: (entry: PersistedDeposit) => void;
  lastVisited?: PersistedDeposit;
}>()(
  persist(
    immer((set) => ({
      deposits: {},
      saveValue: (entry) =>
        set((state) => {
          const oldValue = state.deposits[entry.assetId] || null;
          state.deposits[entry.assetId] = { ...oldValue, ...entry };
          state.lastVisited = { ...oldValue, ...entry };
          return state;
        }),
    })),
    { name: STORAGE_KEY }
  )
);

export const usePersistentDeposit = (
  assetId?: string
): [PersistedDeposit | undefined, (entry: PersistedDeposit) => void] => {
  const { deposits, lastVisited, saveValue } = usePersistentDepositStore();
  const discoveredData = useMemo(() => {
    return assetId
      ? deposits[assetId]
        ? deposits[assetId]
        : { assetId }
      : lastVisited;
  }, [deposits, lastVisited, assetId]);

  return [discoveredData, saveValue];
};
