import create from 'zustand';
import produce from 'immer';
import type { ethers } from 'ethers';
import type { EthereumError } from './ethereum-error';
import { isExpectedEthereumError } from './ethereum-error';
import { isEthereumError } from './ethereum-error';

import type { MultisigControl } from '@vegaprotocol/smart-contracts';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import type { Token } from '@vegaprotocol/smart-contracts';
import type { TokenFaucetable } from '@vegaprotocol/smart-contracts';
import {
  useDepositBusEventSubscription,
  useVegaWallet,
} from '@vegaprotocol/wallet';

import type { DepositBusEventFieldsFragment } from '@vegaprotocol/wallet';
import { Schema } from '@vegaprotocol/types';

import type { EthTxState } from './use-ethereum-transaction';
import { EthTxStatus } from './use-ethereum-transaction';

type Contract = MultisigControl & CollateralBridge & Token & TokenFaucetable;
type ContractMethod =
  | keyof MultisigControl
  | keyof CollateralBridge
  | keyof Token
  | keyof TokenFaucetable;

interface EthStoredTxState extends EthTxState {
  id: number;
  contract: Contract;
  methodName: ContractMethod;
  args: string[];
  requiredConfirmations: number;
  requiresConfirmation: boolean;
  deposit?: DepositBusEventFieldsFragment;
}

interface EthTransactionStore {
  transactions: (EthStoredTxState | undefined)[];
  create: (
    contract: Contract,
    methodName: ContractMethod,
    args: string[],
    requiredConfirmations: number,
    requiresConfirmation: boolean
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
  updateDeposit: (deposit: DepositBusEventFieldsFragment) => void;
  delete: (index: number) => void;
}

export const useEthTransactionStore = create<EthTransactionStore>(
  (set, get) => ({
    transactions: [] as EthStoredTxState[],
    create: (
      contract: Contract,
      methodName: ContractMethod,
      args: string[] = [],
      requiredConfirmations: number,
      requiresConfirmation: boolean
    ) => {
      const transactions = get().transactions;
      const transaction: EthStoredTxState = {
        id: transactions.length,
        contract,
        methodName,
        args,
        status: EthTxStatus.Default,
        error: null,
        txHash: null,
        receipt: null,
        confirmations: 0,
        dialogOpen: false,
        requiredConfirmations,
        requiresConfirmation,
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
          }
        }),
      });
    },
    updateDeposit: (deposit: DepositBusEventFieldsFragment) => {
      set(
        produce((state: EthTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction &&
              transaction.status === EthTxStatus.Pending &&
              deposit.txHash === transaction.txHash
          );
          if (!transaction) {
            return;
          }
          transaction.status = EthTxStatus.Confirmed;
          transaction.deposit = deposit;
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
  })
);

export const useEthTransactionManager = () => {
  const update = useEthTransactionStore((state) => state.update);
  const transaction = useEthTransactionStore((state) =>
    state.transactions.find(
      (transaction) => transaction?.status === EthTxStatus.Default
    )
  );

  if (transaction) {
    (async () => {
      update(transaction.id, {
        status: EthTxStatus.Requested,
        error: null,
        confirmations: 0,
      });
      const {
        contract,
        methodName,
        args,
        requiredConfirmations,
        requiresConfirmation,
      } = transaction;
      try {
        if (
          !contract ||
          (typeof methodName in contract &&
            contract[methodName] !== 'function') ||
          typeof contract.contract.callStatic[methodName] !== 'function'
        ) {
          throw new Error('method not found on contract');
        }
        await contract.contract.callStatic[methodName as string](...args);
      } catch (err) {
        update(transaction.id, {
          status: EthTxStatus.Error,
          error: err as EthereumError,
        });
        return;
      }

      try {
        const method = contract[methodName];

        if (!method || typeof method !== 'function') {
          throw new Error('method not found on contract');
        }

        // @ts-ignore args will vary depends on contract and method
        const tx = await method.call(contract, ...args);

        let receipt: ethers.ContractReceipt | null = null;

        update(transaction.id, {
          status: EthTxStatus.Pending,
          txHash: tx.hash,
        });

        for (let i = 1; i <= requiredConfirmations; i++) {
          receipt = await tx.wait(i);
          update(transaction.id, {
            confirmations: receipt
              ? receipt.confirmations
              : requiredConfirmations,
          });
        }

        if (!receipt) {
          throw new Error('no receipt after confirmations are met');
        }

        if (requiresConfirmation) {
          update(transaction.id, { status: EthTxStatus.Complete, receipt });
        } else {
          update(transaction.id, { status: EthTxStatus.Confirmed, receipt });
        }
      } catch (err) {
        if (err instanceof Error || isEthereumError(err)) {
          if (!isExpectedEthereumError(err)) {
            update(transaction.id, { status: EthTxStatus.Error, error: err });
          }
        } else {
          update(transaction.id, {
            status: EthTxStatus.Error,
            error: new Error('Something went wrong'),
          });
        }
        return;
      }
    })();
  }
};

export const useEthTransactionUpdater = () => {
  const { pubKey } = useVegaWallet();
  const updateDeposit = useEthTransactionStore((state) => state.updateDeposit);
  const variables = { partyId: pubKey || '' };
  const skip = !!pubKey;
  useDepositBusEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (
          event.event.__typename === 'Deposit' &&
          // Note there is a bug in data node where the subscription is not emitted when the status
          // changes from 'Open' to 'Finalized' as a result the deposit UI will hang in a pending state right now
          // https://github.com/vegaprotocol/data-node/issues/460
          event.event.status === Schema.DepositStatus.STATUS_FINALIZED
        ) {
          updateDeposit(event.event);
        }
      }),
  });
};
