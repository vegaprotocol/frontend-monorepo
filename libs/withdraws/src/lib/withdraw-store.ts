import type { Asset } from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import type { SetState } from 'zustand';
import create from 'zustand';

interface WithdrawStore {
  asset: Asset | undefined;
  balance: BigNumber;
  min: BigNumber;
  threshold: BigNumber;
  delay: number | undefined;
  update: (state: Partial<WithdrawStore>) => void;
}

export const useWithdrawStore = create((set: SetState<WithdrawStore>) => ({
  asset: undefined,
  balance: new BigNumber(0),
  min: new BigNumber(0),
  threshold: new BigNumber(0),
  delay: undefined,
  update: (updatedState) => {
    set(updatedState);
  },
}));
