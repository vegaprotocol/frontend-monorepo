import { formatLabel } from '@vegaprotocol/utils';
import type { ethers } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import type { EthereumError } from './ethereum-error';
import { isExpectedEthereumError } from './ethereum-error';
import { isEthereumError } from './ethereum-error';
import {
  EthereumTransactionDialog,
  getTransactionContent,
} from './ethereum-transaction-dialog';
import { useT } from './use-t';

export enum EthTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Complete = 'Complete',
  Confirmed = 'Confirmed',
  Error = 'Error',
}

export type TxError = Error | EthereumError;

export interface EthTxState {
  status: EthTxStatus;
  error: TxError | null;
  txHash: string | null;
  receipt: ethers.ContractReceipt | null;
  confirmations: number;
  dialogOpen: boolean;
}

export const initialState = {
  status: EthTxStatus.Default,
  error: null,
  txHash: null,
  receipt: null,
  confirmations: 0,
  dialogOpen: false,
};

type DefaultContract = {
  contract: ethers.Contract;
};

export const useEthereumTransaction = <
  TContract extends DefaultContract,
  TMethod extends string
>(
  contract: TContract | null,
  methodName: keyof TContract,
  requiredConfirmations = 1,
  requiresConfirmation = false
) => {
  const t = useT();
  const [transaction, _setTransaction] = useState<EthTxState>(initialState);

  const setTransaction = useCallback((update: Partial<EthTxState>) => {
    _setTransaction((curr) => ({
      ...curr,
      ...update,
    }));
  }, []);

  const perform = useCallback(
    // @ts-ignore TS errors here as TMethod doesn't satisfy the constraints on TContract
    // its a tricky one to fix but does enforce the correct types when calling perform
    async (...args: Parameters<TContract[TMethod]>) => {
      setTransaction({
        status: EthTxStatus.Requested,
        error: null,
        confirmations: 0,
        dialogOpen: true,
      });

      try {
        if (
          !contract ||
          typeof contract[methodName] !== 'function' ||
          typeof contract.contract.callStatic[methodName as string] !==
            'function'
        ) {
          throw new Error('method not found on contract');
        }
        await contract.contract.callStatic[methodName as string](...args);
      } catch (err) {
        setTransaction({
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

        setTransaction({ status: EthTxStatus.Pending, txHash: tx.hash });

        for (let i = 1; i <= requiredConfirmations; i++) {
          receipt = await tx.wait(i);
          setTransaction({
            confirmations: receipt
              ? receipt.confirmations
              : requiredConfirmations,
          });
        }

        if (!receipt) {
          throw new Error('no receipt after confirmations are met');
        }

        if (requiresConfirmation) {
          setTransaction({ status: EthTxStatus.Complete, receipt });
        } else {
          setTransaction({ status: EthTxStatus.Confirmed, receipt });
        }
      } catch (err) {
        if (err instanceof Error || isEthereumError(err)) {
          if (isExpectedEthereumError(err)) {
            setTransaction({ dialogOpen: false });
          } else {
            setTransaction({ status: EthTxStatus.Error, error: err });
          }
        } else {
          setTransaction({
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
      setTransaction,
    ]
  );

  const reset = useCallback(() => {
    setTransaction(initialState);
  }, [setTransaction]);

  const setConfirmed = useCallback(() => {
    setTransaction({ status: EthTxStatus.Confirmed });
  }, [setTransaction]);

  const Dialog = useMemo(() => {
    return () => (
      <EthereumTransactionDialog
        title={formatLabel(methodName as string)}
        onChange={() => {
          reset();
        }}
        transaction={transaction}
        requiredConfirmations={requiredConfirmations}
      />
    );
  }, [methodName, transaction, requiredConfirmations, reset]);

  const TxContent = useMemo(
    () =>
      getTransactionContent({
        title: formatLabel(methodName as string),
        transaction,
        requiredConfirmations,
        reset,
        t,
      }),
    [methodName, requiredConfirmations, reset, transaction, t]
  );

  return { perform, transaction, reset, setConfirmed, Dialog, TxContent };
};

export type EthTransaction = ReturnType<typeof useEthereumTransaction>;
