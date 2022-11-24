import produce from 'immer';
import { useVegaWallet } from './use-vega-wallet';
import type { Transaction } from './connectors';
import { ClientErrors, isWithdrawTransaction } from './connectors';
import { WalletError } from './connectors';
import { determineId } from './utils';

import create from 'zustand';
import type { VegaTxState } from './use-vega-transaction';
import { VegaTxStatus } from './use-vega-transaction';
import { useTransactionUpdateSubscription } from './__generated__/TransactionUpdate';
import type {
  TransactionResultEventFragment,
  WithdrawalEventFragment,
  OrderEventFragment,
  DepositEventFragment,
} from './__generated__/TransactionUpdate';

export interface VegaStoredTxState extends VegaTxState {
  id: number;
  body: Transaction;
  transactionResult?: TransactionResultEventFragment;
  withdrawal?: WithdrawalEventFragment;
  order?: OrderEventFragment;
  deposit?: DepositEventFragment;
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
  updateWithdrawal: (withdrawal: WithdrawalEventFragment) => void;
  updateOrder: (order: OrderEventFragment) => void;
  updateDeposit: (deposit: DepositEventFragment) => void;
  updateTransaction: (
    transactionResult: TransactionResultEventFragment
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
    updateWithdrawal: (withdrawal: WithdrawalEventFragment) => {
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
    updateOrder: (order: OrderEventFragment) => {},
    updateDeposit: (deposit: DepositEventFragment) => {},
    updateTransaction: (
      transactionResult: TransactionResultEventFragment
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
  useTransactionUpdateSubscription({
    variables: { partyId: pubKey || '' },
    skip: !!pubKey,
    onData: ({ data: result }) => {
      const { data } = result;
      data?.busEvents?.forEach((event) => {
        switch (event.event.__typename) {
          case 'TransactionResult':
            updateTransaction(event.event);
            break;
          case 'Withdrawal':
            updateWithdrawal(event.event);
            break;
          case 'Deposit':
            updateDeposit(event.event);
            break;
          case 'Order':
            updateOrder(event.event);
            break;
        }
      });
    },
  });
};
