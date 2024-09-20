import { create, type StoreApi } from 'zustand';
import {
  createEvmDepositSlice,
  type DepositSlice,
  type TxDeposit,
} from './use-evm-deposit-slice';
import {
  createEvmWithdrawSlice,
  type TxWithdraw,
  type WithdrawSlice,
} from './use-evm-withdraw-slice';
import {
  createEvmFaucetSlice,
  type FaucetSlice,
  type TxFaucet,
} from './use-evm-faucet-slice';

export type Status =
  | 'idle'
  | 'switch'
  | 'requested'
  | 'pending'
  | 'finalized' // finalized on vega
  | 'error';

export type Tx = TxDeposit | TxWithdraw | TxFaucet;

// eslint-disable-next-line
type SquidDepositConfig = {};

export type DefaultSlice = {
  txs: Map<string, Tx>;
  setTx: (id: string, tx: Partial<Tx>) => void;
  // squidDeposit: (
  //   id: string,
  //   config: SquidDepositConfig
  // ) => Promise<Tx | undefined>;
};

export type Store = DefaultSlice & DepositSlice & WithdrawSlice & FaucetSlice;

const createDefaultSlice = (
  set: StoreApi<DefaultSlice>['setState'],
  get: StoreApi<DefaultSlice>['getState']
) => ({
  txs: new Map(),
  setTx: (id: string, tx: Partial<Tx>) => {
    set((prev) => {
      const curr = prev.txs.get(id);
      const newTx = {
        ...curr,
        ...tx,
      };
      return {
        txs: new Map(prev.txs).set(id, newTx as Tx),
      };
    });
  },
});

// TODO: we may want to actually update a store of the tx
export const useEvmTxStore = create<Store>()((set, get) => ({
  ...createDefaultSlice(set, get),
  ...createEvmDepositSlice(set, get),
  ...createEvmWithdrawSlice(set, get),
  ...createEvmFaucetSlice(set, get),
  // squidDeposit: async (id: string, config) => {
  //   return get().txs.get(id);
  // },
}));
