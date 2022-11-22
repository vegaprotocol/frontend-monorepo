import produce from 'immer';
import { useVegaWallet } from './use-vega-wallet';
import type { Transaction } from './connectors';
import { ClientErrors } from './connectors';
import { WalletError } from './connectors';

import create from 'zustand';
import type { VegaTxState } from './use-vega-transaction';
import { VegaTxStatus } from './use-vega-transaction';

interface VegaStoredTxState extends VegaTxState {
  id: number;
  body: Transaction;
  pubKey: string;
}

export const useVegaTransactionStore = create<{
  transactions: (VegaStoredTxState | undefined)[];
  send: (pubKey: string, tx: Transaction) => number;
  update: (
    id: VegaStoredTxState['id'],
    update?: Partial<VegaStoredTxState>
  ) => void;
  get: (id: VegaStoredTxState['id']) => VegaStoredTxState | undefined;
}>((set, get) => ({
  transactions: [] as VegaStoredTxState[],
  update: (
    id: VegaStoredTxState['id'],
    update?: Partial<VegaStoredTxState>
  ) => {
    set({
      transactions: produce(get().transactions, (draft) => {
        const transaction = draft.find((transaction) => transaction?.id === id);
        if (transaction) {
          Object.assign(transaction, update);
        }
      }),
    });
  },
  get: (id: number) =>
    get().transactions.find((transaction) => transaction?.id === id),
  send: (pubKey: string, body: Transaction) => {
    const transactions = get().transactions;
    const transaction: VegaStoredTxState = {
      id: transactions.length,
      body,
      pubKey,
      error: null,
      txHash: null,
      signature: null,
      status: VegaTxStatus.Requested,
      dialogOpen: true,
    };
    set({ transactions: transactions.concat(transaction) });
    return transaction.id;
  },
}));

export const useVegaWalletTransactionManager = () => {
  const { sendTx } = useVegaWallet();
  const requestedTransaction = useVegaTransactionStore((state) =>
    state.transactions.find(
      (transaction) => transaction?.status === VegaTxStatus.Requested
    )
  );
  const update = useVegaTransactionStore((state) => state.update);
  if (requestedTransaction) {
    sendTx(requestedTransaction.pubKey, requestedTransaction.body)
      .then((res) => {
        if (res === null) {
          // User rejected
          update(requestedTransaction.id);
          return;
        }
        if (res.signature && res.transactionHash) {
          update(requestedTransaction.id, {
            status: VegaTxStatus.Pending,
            txHash: res.transactionHash,
            signature: res.signature,
          });
        }
      })
      .catch((err) => {
        update(requestedTransaction.id, {
          error: err instanceof WalletError ? err : ClientErrors.UNKNOWN,
          status: VegaTxStatus.Error,
        });
      });
  }
};
