import { create, type StoreApi } from 'zustand';
import { type PartialDeep } from 'type-fest';
import {
  createEvmDepositSlice,
  type DepositSlice,
  type TxDeposit,
} from './deposit-slice';
import {
  createEvmSquidDepositSlice,
  type SquidDepositSlice,
  type TxSquidDeposit,
} from './squid-deposit-slice';
import {
  createEvmWithdrawSlice,
  type TxWithdraw,
  type WithdrawSlice,
} from './withdraw-slice';
import {
  createEvmFaucetSlice,
  type FaucetSlice,
  type TxFaucet,
} from './faucet-slice';

export type Status =
  | 'idle'
  | 'switch'
  | 'requested'
  | 'pending'
  | 'finalized' // finalized on chain
  | 'error';

export type TxCommon = {
  id: string;
  status: Status;
  chainId: number;
  confirmations: number;
  requiredConfirmations: number;
  error?: Error;
};

export type Tx = TxDeposit | TxSquidDeposit | TxWithdraw | TxFaucet;

export type DefaultSlice = {
  txs: Map<string, Tx>;
  setTx: (id: string, tx: PartialDeep<Tx>, isReset?: boolean) => void;
  resetTx: (id: string) => void;
};

export type Store = DefaultSlice &
  DepositSlice &
  SquidDepositSlice &
  WithdrawSlice &
  FaucetSlice;

const createDefaultSlice = (
  set: StoreApi<DefaultSlice>['setState'],
  get: StoreApi<DefaultSlice>['getState']
) => ({
  txs: new Map(),
  setTx: (id: string, tx: PartialDeep<Tx>, isReset = false) => {
    set((prev) => {
      const curr = prev.txs.get(id);
      const newTx = {
        ...curr,
        ...tx,
        data: isReset
          ? undefined
          : {
              ...curr?.data,
              ...tx.data,
            },
      };
      return {
        txs: new Map(prev.txs).set(id, newTx as Tx),
      };
    });
  },
  resetTx: (id: string) => {
    get().setTx(
      id,
      {
        status: 'idle',
        confirmations: 0,
        data: undefined,
        error: undefined,
      },
      true
    );
  },
});

export const useEvmTxStore = create<Store>()((set, get) => ({
  ...createDefaultSlice(set, get),
  ...createEvmDepositSlice(set, get),
  ...createEvmSquidDepositSlice(set, get),
  ...createEvmWithdrawSlice(set, get),
  ...createEvmFaucetSlice(set, get),
}));
