import { type AssetData } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import { create } from 'zustand';

export interface WithdrawStore {
  asset: AssetData | undefined;
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
