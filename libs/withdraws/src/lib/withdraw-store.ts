import type { Asset } from '@vegaprotocol/assets';
import BigNumber from 'bignumber.js';
import { create } from 'zustand';

export interface WithdrawStore {
  asset: Asset | undefined;
  balance: BigNumber;
  min: BigNumber;
  threshold: BigNumber;
  delay: number | undefined;
  update: (state: Partial<WithdrawStore>) => void;
}

export const useWithdrawStore = create<WithdrawStore>()((set) => ({
  asset: undefined,
  balance: new BigNumber(0),
  min: new BigNumber(0),
  threshold: new BigNumber(0),
  delay: undefined,
  update: (updatedState) => {
    set(updatedState);
  },
}));
