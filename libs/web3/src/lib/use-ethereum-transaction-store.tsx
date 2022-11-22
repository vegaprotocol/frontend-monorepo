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
}

export const useEthTransactionStore = create<{
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
}));

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
        dialogOpen: true,
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
          if (isExpectedEthereumError(err)) {
            update(transaction.id, { dialogOpen: false });
          } else {
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
