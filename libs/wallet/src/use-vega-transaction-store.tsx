import produce from 'immer';
import { useVegaWallet } from './use-vega-wallet';
import type { Transaction } from './connectors';
import { ClientErrors, isWithdrawTransaction } from './connectors';
import { WalletError } from './connectors';
import { determineId } from './utils';

import create from 'zustand';
import type { VegaTxState } from './use-vega-transaction';
import { VegaTxStatus } from './use-vega-transaction';
import {
  useDepositBusEventSubscription,
  useOrderBusEventsSubscription,
  useWithdrawalBusEventSubscription,
  useTransactionEventSubscription,
} from './__generated__/TransactionResult';
import type {
  TransactionEventFieldsFragment,
  WithdrawalBusEventFieldsFragment,
  OrderBusEventFieldsFragment,
  DepositBusEventFieldsFragment,
} from './__generated__/TransactionResult';

export interface VegaStoredTxState extends VegaTxState {
  id: number;
  body: Transaction;
  transactionResult?: TransactionEventFieldsFragment;
  withdrawal?: WithdrawalBusEventFieldsFragment;
  order?: OrderBusEventFieldsFragment;
  deposit?: DepositBusEventFieldsFragment;
}
interface VegaTransactionStore {
  transactions: (VegaStoredTxState | undefined)[];
  create: (tx: Transaction) => number;
  update: (
    index: number,
    update: Partial<
      Pick<VegaStoredTxState, 'status' | 'txHash' | 'signature' | 'error'>
    >
  ) => void;
  delete: (index: number) => void;
  updateWithdrawal: (withdrawal: WithdrawalBusEventFieldsFragment) => void;
  updateOrder: (order: OrderBusEventFieldsFragment) => void;
  updateDeposit: (deposit: DepositBusEventFieldsFragment) => void;
  updateTransaction: (
    transactionResult: TransactionEventFieldsFragment
  ) => void;
}

export const useVegaTransactionStore = create<VegaTransactionStore>(
  (set, get) => ({
    transactions: [] as VegaStoredTxState[],
    create: (body: Transaction) => {
      const transactions = get().transactions;
      const transaction: VegaStoredTxState = {
        id: transactions.length,
        body,
        error: null,
        txHash: null,
        signature: null,
        status: VegaTxStatus.Requested,
        dialogOpen: true,
      };
      set({ transactions: transactions.concat(transaction) });
      return transaction.id;
    },
    update: (index: number, update: Partial<VegaStoredTxState>) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions[index];
          if (transaction) {
            Object.assign(transaction, update);
          }
        })
      );
    },
    delete: (index: number) => {
      set(
        produce((state: VegaTransactionStore) => {
          delete state.transactions[index];
        })
      );
    },
    updateWithdrawal: (withdrawal: WithdrawalBusEventFieldsFragment) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction &&
              transaction.status === VegaTxStatus.Pending &&
              transaction.signature &&
              isWithdrawTransaction(transaction?.body) &&
              withdrawal.id === determineId(transaction.signature) // can we use withdrawal.txHash === transaction.txHash
          );
          if (transaction) {
            transaction.withdrawal = withdrawal;
          }
        })
      );
    },
    /* eslint-disable */
    updateOrder: (order: OrderBusEventFieldsFragment) => {},
    updateDeposit: (deposit: DepositBusEventFieldsFragment) => {},
    updateTransaction: (
      transactionResult: TransactionEventFieldsFragment
    ) => {},
    /* eslint-enable */
  })
);

export const useVegaWalletTransactionManager = () => {
  const { sendTx, pubKey } = useVegaWallet();
  const transaction = useVegaTransactionStore((state) =>
    state.transactions.find(
      (transaction) => transaction?.status === VegaTxStatus.Requested
    )
  );
  const update = useVegaTransactionStore((state) => state.update);
  const del = useVegaTransactionStore((state) => state.delete);
  if (!(transaction && pubKey)) {
    return;
  }
  // #TODO store index of transaction in ref that was sent to avoid processing single transaction many times
  sendTx(pubKey, transaction.body)
    .then((res) => {
      if (res === null) {
        // User rejected
        del(transaction.id);
        return;
      }
      if (res.signature && res.transactionHash) {
        update(transaction.id, {
          status: VegaTxStatus.Pending,
          txHash: res.transactionHash,
          signature: res.signature,
        });
      }
    })
    .catch((err) => {
      update(transaction.id, {
        error: err instanceof WalletError ? err : ClientErrors.UNKNOWN,
        status: VegaTxStatus.Error,
      });
    });
};

export const useVegaWalletTransactionUpdater = () => {
  const { updateWithdrawal, updateOrder, updateDeposit, updateTransaction } =
    useVegaTransactionStore((state) => ({
      updateWithdrawal: state.updateWithdrawal,
      updateOrder: state.updateOrder,
      updateDeposit: state.updateDeposit,
      updateTransaction: state.updateTransaction,
    }));
  const { pubKey } = useVegaWallet();
  const variables = { partyId: pubKey || '' };
  const skip = !!pubKey;
  useDepositBusEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'Deposit') {
          updateDeposit(event.event);
        }
      }),
  });
  useOrderBusEventsSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'Order') {
          updateOrder(event.event);
        }
      }),
  });
  useWithdrawalBusEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'Withdrawal') {
          updateWithdrawal(event.event);
        }
      }),
  });
  useTransactionEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'TransactionResult') {
          updateTransaction(event.event);
        }
      }),
  });
};
