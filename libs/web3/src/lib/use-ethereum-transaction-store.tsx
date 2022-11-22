import create from 'zustand';
import produce from 'immer';
import type { ethers } from 'ethers';
import { useCallback } from 'react';
import type { EthereumError } from './ethereum-error';
import { isExpectedEthereumError } from './ethereum-error';
import { isEthereumError } from './ethereum-error';

import type { MultisigControl } from '@vegaprotocol/smart-contracts';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import type { Token } from '@vegaprotocol/smart-contracts';
import type { TokenFaucetable } from '@vegaprotocol/smart-contracts';

import type { EthTxState } from './use-ethereum-transaction';
import { EthTxStatus } from './use-ethereum-transaction';

type Contract = MultisigControl | CollateralBridge | Token | TokenFaucetable;

interface EthStoredTxState extends EthTxState {
  id: number;
  contract: Contract;
  methodName: string;
  requiredConfirmations: number;
  requiresConfirmation: boolean;
}

export const useEthTransactionStore = create<{
  transactions: (EthStoredTxState | undefined)[];
  create: (
    contract: Contract,
    methodName: string,
    requiredConfirmations: number,
    requiresConfirmation: boolean
  ) => number;
  update: (
    id: EthStoredTxState['id'],
    update?: Partial<EthStoredTxState>
  ) => void;
  get: (id: EthStoredTxState['id']) => EthStoredTxState | undefined;
}>((set, get) => ({
  transactions: [] as EthStoredTxState[],
  update: (id: EthStoredTxState['id'], update?: Partial<EthStoredTxState>) => {
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
  create: (
    contract: Contract,
    methodName: string,
    requiredConfirmations: number,
    requiresConfirmation: boolean
  ) => {
    const transactions = get().transactions;
    const transaction: EthStoredTxState = {
      id: transactions.length,
      contract,
      methodName,
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
}));

export const useStoredEthereumTransaction = <T, K extends keyof T>(
  contract: Contract & T,
  methodName: string & K,
  requiredConfirmations = 1,
  requiresConfirmation = false
) => {
  const update = useEthTransactionStore((state) => state.update);
  const create = useEthTransactionStore((state) => state.create);
  const id = create(
    contract,
    methodName,
    requiredConfirmations,
    requiresConfirmation
  );

  const perform = useCallback(
    // @ts-ignore TS errors here as TMethod doesn't satisfy the constraints on TContract
    // its a tricky one to fix but does enforce the correct types when calling perform
    async (...args: Parameters<T[K]>) => {
      update(id, {
        status: EthTxStatus.Requested,
        error: null,
        confirmations: 0,
        dialogOpen: true,
      });

      try {
        if (
          !contract ||
          typeof contract[methodName] !== 'function' ||
          typeof contract.contract.callStatic[methodName] !== 'function'
        ) {
          throw new Error('method not found on contract');
        }
        await contract.contract.callStatic[methodName as string](...args);
      } catch (err) {
        update(id, {
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

        const tx = await method.call(contract, ...args);

        let receipt: ethers.ContractReceipt | null = null;

        update(id, { status: EthTxStatus.Pending, txHash: tx.hash });

        for (let i = 1; i <= requiredConfirmations; i++) {
          receipt = await tx.wait(i);
          update(id, {
            confirmations: receipt
              ? receipt.confirmations
              : requiredConfirmations,
          });
        }

        if (!receipt) {
          throw new Error('no receipt after confirmations are met');
        }

        if (requiresConfirmation) {
          update(id, { status: EthTxStatus.Complete, receipt });
        } else {
          update(id, { status: EthTxStatus.Confirmed, receipt });
        }
      } catch (err) {
        if (err instanceof Error || isEthereumError(err)) {
          if (isExpectedEthereumError(err)) {
            update(id, { dialogOpen: false });
          } else {
            update(id, { status: EthTxStatus.Error, error: err });
          }
        } else {
          update(id, {
            status: EthTxStatus.Error,
            error: new Error('Something went wrong'),
          });
        }
        return;
      }
    },
    [
      contract,
      methodName,
      requiredConfirmations,
      requiresConfirmation,
      update,
      id,
    ]
  );

  const setConfirmed = useCallback(() => {
    update(id, { status: EthTxStatus.Confirmed });
  }, [update, id]);

  return { perform, id, setConfirmed };
};
