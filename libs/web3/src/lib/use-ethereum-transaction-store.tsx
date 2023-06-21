import { create } from 'zustand';
import produce from 'immer';
import type { MultisigControl } from '@vegaprotocol/smart-contracts';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import type { Token } from '@vegaprotocol/smart-contracts';

import type {
  DepositBusEventFieldsFragment,
  WithdrawalBusEventFieldsFragment,
} from '@vegaprotocol/wallet';

import type { EthTxState } from './use-ethereum-transaction';
import { EthTxStatus } from './use-ethereum-transaction';
import { subscribeWithSelector } from 'zustand/middleware';

type Contract = MultisigControl | CollateralBridge | Token;
type ContractMethod =
  | keyof MultisigControl
  | keyof CollateralBridge
  | keyof Token;

export interface EthStoredTxState extends EthTxState {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  contract: Contract | null;
  methodName: ContractMethod;
  args: string[];
  requiredConfirmations: number;
  requiresConfirmation: boolean; // whether or not the tx needs external confirmation (IE from a subscription even)
  assetId?: string;
  deposit?: DepositBusEventFieldsFragment;
  withdrawal?: WithdrawalBusEventFieldsFragment;
}

export interface EthTransactionStore {
  transactions: (EthStoredTxState | undefined)[];
  create: (
    contract: Contract | null,
    methodName: ContractMethod,
    args: string[],
    assetId?: string,
    requiredConfirmations?: number,
    requiresConfirmation?: boolean,
    withdrawal?: EthStoredTxState['withdrawal']
  ) => number;
  update: (
    id: EthStoredTxState['id'],
    update?: Partial<
      Pick<
        EthStoredTxState,
        'status' | 'error' | 'receipt' | 'confirmations' | 'txHash'
      >
    >
  ) => void;
  dismiss: (index: number) => void;
  updateDeposit: (deposit: DepositBusEventFieldsFragment) => void;
  delete: (index: number) => void;
}

export const useEthTransactionStore = create<EthTransactionStore>()(
  subscribeWithSelector((set, get) => ({
    transactions: [] as EthStoredTxState[],
    create: (
      contract: Contract | null,
      methodName: ContractMethod,
      args: string[] = [],
      assetId?: string,
      requiredConfirmations = 1,
      requiresConfirmation = false,
      withdrawal = undefined
    ) => {
      const transactions = get().transactions;
      const now = new Date();
      const transaction: EthStoredTxState = {
        id: transactions.length,
        createdAt: now,
        updatedAt: now,
        contract,
        methodName,
        args,
        status: EthTxStatus.Default,
        error: null,
        txHash: null,
        receipt: null,
        confirmations: 0,
        dialogOpen: true,
        requiredConfirmations,
        requiresConfirmation,
        assetId,
        withdrawal,
      };
      set({ transactions: transactions.concat(transaction) });
      return transaction.id;
    },
    update: (
      id: EthStoredTxState['id'],
      update?: Partial<EthStoredTxState>
    ) => {
      set({
        transactions: produce(get().transactions, (draft) => {
          const transaction = draft.find(
            (transaction) => transaction?.id === id
          );
          if (transaction) {
            Object.assign(transaction, update);
            transaction.dialogOpen = true;
            transaction.updatedAt = new Date();
          }
        }),
      });
    },
    dismiss: (index: number) => {
      set(
        produce((state: EthTransactionStore) => {
          const transaction = state.transactions[index];
          if (transaction) {
            transaction.dialogOpen = false;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
    updateDeposit: (deposit: DepositBusEventFieldsFragment) => {
      set(
        produce((state: EthTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction && deposit.txHash === transaction.txHash
          );
          if (!transaction) {
            return;
          }
          transaction.status = EthTxStatus.Confirmed;
          transaction.deposit = deposit;
          transaction.dialogOpen = true;
          transaction.updatedAt = new Date();
        })
      );
    },
    delete: (index: number) => {
      set(
        produce((state: EthTransactionStore) => {
          delete state.transactions[index];
        })
      );
    },
  }))
);
