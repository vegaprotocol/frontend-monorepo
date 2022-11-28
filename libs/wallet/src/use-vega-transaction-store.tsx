import produce from 'immer';
import type { ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { useVegaWallet } from './use-vega-wallet';
import type { Transaction } from './connectors';
import { useRef } from 'react';
import {
  ClientErrors,
  isWithdrawTransaction,
  isOrderSubmissionTransaction,
  isOrderCancellationTransaction,
  isOrderAmendmentTransaction,
} from './connectors';
import { WalletError } from './connectors';
import { determineId } from './utils';

import create from 'zustand';
import type { VegaTxState } from './use-vega-transaction';
import { VegaTxStatus } from './use-vega-transaction';
import {
  useOrderBusEventsSubscription,
  useWithdrawalBusEventSubscription,
  useTransactionEventSubscription,
} from './__generated__/TransactionResult';
import type {
  TransactionEventFieldsFragment,
  WithdrawalBusEventFieldsFragment,
  OrderBusEventFieldsFragment,
} from './__generated__/TransactionResult';

import type {
  WithdrawalApprovalQuery,
  WithdrawalApprovalQueryVariables,
} from './__generated__/WithdrawalApproval';
import { WithdrawalApprovalDocument } from './__generated__/WithdrawalApproval';

export interface VegaStoredTxState extends VegaTxState {
  id: number;
  body: Transaction;
  transactionResult?: TransactionEventFieldsFragment;
  withdrawal?: WithdrawalBusEventFieldsFragment;
  withdrawalApproval?: WithdrawalApprovalQuery['erc20WithdrawalApproval'];
  order?: OrderBusEventFieldsFragment;
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
  updateWithdrawal: (
    withdrawal: NonNullable<VegaStoredTxState['withdrawal']>,
    withdrawalApproval: NonNullable<VegaStoredTxState['withdrawalApproval']>
  ) => void;
  updateOrder: (order: OrderBusEventFieldsFragment) => void;
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
    updateWithdrawal: (
      withdrawal: NonNullable<VegaStoredTxState['withdrawal']>,
      withdrawalApproval: NonNullable<VegaStoredTxState['withdrawalApproval']>
    ) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction &&
              transaction.status === VegaTxStatus.Pending &&
              transaction.signature &&
              isWithdrawTransaction(transaction?.body) &&
              withdrawal.id === determineId(transaction.signature)
          );
          if (transaction) {
            transaction.withdrawal = withdrawal;
            transaction.withdrawalApproval = withdrawalApproval;
            transaction.status = VegaTxStatus.Complete;
          }
        })
      );
    },
    updateOrder: (order: OrderBusEventFieldsFragment) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction &&
              transaction.status === VegaTxStatus.Pending &&
              transaction.signature &&
              (isOrderSubmissionTransaction(transaction?.body) ||
                isOrderCancellationTransaction(transaction?.body) ||
                isOrderAmendmentTransaction(transaction?.body)) &&
              order.id === determineId(transaction.signature)
          );
          if (transaction) {
            transaction.order = order;
            transaction.status = VegaTxStatus.Complete;
          }
        })
      );
    },
    updateTransaction: (transactionResult: TransactionEventFieldsFragment) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction?.txHash &&
              transaction.txHash.toLowerCase() ===
                transactionResult.hash.toLowerCase()
          );
          if (transaction) {
            transaction.transactionResult = transactionResult;
          }
        })
      );
    },
  })
);

export const useVegaWalletTransactionManager = () => {
  const { sendTx, pubKey } = useVegaWallet();
  const processed = useRef<Set<number>>(new Set());
  const transaction = useVegaTransactionStore((state) =>
    state.transactions.find(
      (transaction) =>
        transaction?.status === VegaTxStatus.Requested &&
        !processed.current.has(transaction.id)
    )
  );
  const update = useVegaTransactionStore((state) => state.update);
  const del = useVegaTransactionStore((state) => state.delete);
  if (!(transaction && pubKey)) {
    return;
  }
  processed.current.add(transaction.id);
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

const waitForWithdrawalApproval = (
  withdrawalId: string,
  client: ApolloClient<object>
) =>
  new Promise<NonNullable<VegaStoredTxState['withdrawalApproval']>>(
    (resolve) => {
      const interval = setInterval(async () => {
        try {
          const res = await client.query<
            WithdrawalApprovalQuery,
            WithdrawalApprovalQueryVariables
          >({
            query: WithdrawalApprovalDocument,
            variables: { withdrawalId },
            fetchPolicy: 'network-only',
          });

          if (
            res.data.erc20WithdrawalApproval &&
            res.data.erc20WithdrawalApproval.signatures.length > 2
          ) {
            clearInterval(interval);
            resolve(res.data.erc20WithdrawalApproval);
          }
        } catch (err) {
          // no op as the query will error until the approval is created
        }
      }, 1000);
    }
  );

export const useVegaWalletTransactionUpdater = () => {
  const client = useApolloClient();
  const { updateWithdrawal, updateOrder, updateTransaction } =
    useVegaTransactionStore((state) => ({
      updateWithdrawal: state.updateWithdrawal,
      updateOrder: state.updateOrder,
      updateTransaction: state.updateTransaction,
    }));
  const { pubKey } = useVegaWallet();
  const variables = { partyId: pubKey || '' };
  const skip = !!pubKey;
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
          const withdrawal = event.event;
          waitForWithdrawalApproval(event.event.id, client).then((approval) =>
            updateWithdrawal(withdrawal, approval)
          );
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
