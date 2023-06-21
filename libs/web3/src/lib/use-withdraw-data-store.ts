import BigNumber from 'bignumber.js';
import { create } from 'zustand';

export const BUILTIN_ASSET_ADDRESS = 'builtin';
export const BUILTIN_ASSET_THRESHOLD = new BigNumber(Infinity);

type TimestampedThreshold = { value: BigNumber; ts: number };
type TimestampedDelay = { value: number | undefined; ts: number };
type WithdrawDataStore = {
  thresholds: Record<string, TimestampedThreshold>;
  delay: TimestampedDelay;
  setThreshold: (contractAddress: string, threshold: BigNumber) => void;
  setDelay: (delay: number) => void;
};

export const useWithdrawDataStore = create<WithdrawDataStore>()((set) => ({
  thresholds: {
    [BUILTIN_ASSET_ADDRESS]: { value: BUILTIN_ASSET_THRESHOLD, ts: 0 },
  },
  delay: {
    value: undefined,
    ts: 0,
  },
  setThreshold: (contractAddress, threshold) =>
    set((state) => {
      state.thresholds[contractAddress] = {
        value: threshold,
        ts: Date.now(),
      };
      return state;
    }),
  setDelay: (delay) => set({ delay: { value: delay, ts: Date.now() } }),
}));
