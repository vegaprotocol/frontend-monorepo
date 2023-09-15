import type { ethers } from 'ethers';
import { useRef, useEffect } from 'react';
import type { EthereumError } from './ethereum-error';
import { isExpectedEthereumError } from './ethereum-error';
import { isEthereumError } from './ethereum-error';
import { EthTxStatus } from './use-ethereum-transaction';
import { useEthTransactionStore } from './use-ethereum-transaction-store';

export const useEthTransactionManager = () => {
  const update = useEthTransactionStore((state) => state.update);
  const processed = useRef<Set<number>>(new Set());
  const transaction = useEthTransactionStore((state) =>
    state.transactions.find(
      (transaction) =>
        transaction?.status === EthTxStatus.Default &&
        !processed.current.has(transaction.id)
    )
  );
  useEffect(() => {
    if (!transaction) {
      return;
    }
    processed.current.add(transaction.id);
    update(transaction.id, {
      status: EthTxStatus.Requested,
      error: null,
      confirmations: 0,
      notify: true,
    });
    const {
      contract,
      methodName,
      args,
      requiredConfirmations,
      requiresConfirmation,
    } = transaction;
    (async () => {
      try {
        if (
          !contract ||
          // @ts-ignore method vary depends on contract
          typeof contract[methodName] !== 'function' ||
          typeof contract.contract.callStatic[methodName] !== 'function'
        ) {
          throw new Error('method not found on contract');
        }
        await contract.contract.callStatic[methodName](...args);
      } catch (err) {
        update(transaction.id, {
          status: EthTxStatus.Error,
          error: err as EthereumError,
          notify: true,
        });
        return;
      }

      try {
        // @ts-ignore args will vary depends on contract and method
        const tx = await contract[methodName].call(contract, ...args);

        let receipt: ethers.ContractReceipt | null = null;

        update(transaction.id, {
          status: EthTxStatus.Pending,
          txHash: tx.hash,
          notify: true,
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
          update(transaction.id, {
            status: EthTxStatus.Complete,
            receipt,
          });
        } else {
          update(transaction.id, {
            status: EthTxStatus.Confirmed,
            receipt,
            notify: true,
          });
        }
      } catch (err) {
        if (err instanceof Error || isEthereumError(err)) {
          if (!isExpectedEthereumError(err)) {
            update(transaction.id, {
              status: EthTxStatus.Error,
              error: err,
              notify: true,
            });
          }
        } else {
          update(transaction.id, {
            status: EthTxStatus.Error,
            error: new Error('Something went wrong'),
            notify: true,
          });
        }
        return;
      }
    })();
  }, [transaction, update]);
};
