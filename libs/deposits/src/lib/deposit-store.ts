import type { Asset } from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import type { SetState } from 'zustand';
import create from 'zustand';

interface DepositStore {
  balance: BigNumber;
  allowance: BigNumber;
  asset: Asset | undefined;
  deposited: BigNumber;
  max: BigNumber;
  update: (state: Partial<DepositStore>) => void;
}

export const useDepositStore = create((set: SetState<DepositStore>) => ({
  balance: new BigNumber(0),
  allowance: new BigNumber(0),
  deposited: new BigNumber(0),
  max: new BigNumber(0),
  asset: undefined,
  update: (updatedState) => {
    set(updatedState);
  },
}));
