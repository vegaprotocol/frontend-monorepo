import type { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import { EthereumError, isEthereumError } from '../lib/ethereum-error';

export enum EthTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
}

export type TxError = Error | EthereumError;

export interface EthTxState {
  status: EthTxStatus;
  error: TxError | null;
  txHash: string | null;
  receipt: ethers.ContractReceipt | null;
  confirmations: number;
}

const initialState = {
  status: EthTxStatus.Default,
  error: null,
  txHash: null,
  receipt: null,
  confirmations: 0,
};

export const useEthereumTransaction = <TArgs = void>(
  performTransaction: (
    args: TArgs
  ) => Promise<ethers.ContractTransaction> | null,
  requiredConfirmations = 1
) => {
  const [transaction, _setTransaction] = useState<EthTxState>(initialState);

  const setTransaction = useCallback((update: Partial<EthTxState>) => {
    _setTransaction((curr) => ({
      ...curr,
      ...update,
    }));
  }, []);

  const perform = useCallback(
    async (args: TArgs) => {
      setTransaction({
        status: EthTxStatus.Requested,
        error: null,
        confirmations: 0,
      });

      try {
        const res = performTransaction(args);

        if (res === null) {
          setTransaction({ status: EthTxStatus.Default });
          return;
        }

        const tx = await res;

        let receipt: ethers.ContractReceipt | null = null;

        setTransaction({ status: EthTxStatus.Pending, txHash: tx.hash });

        for (let i = 1; i <= requiredConfirmations; i++) {
          receipt = await tx.wait(i);
          setTransaction({ confirmations: receipt.confirmations });
        }

        if (!receipt) {
          throw new Error('No receipt after confirmations are met');
        }

        setTransaction({ status: EthTxStatus.Complete, receipt });
      } catch (err) {
        if (err instanceof Error) {
          setTransaction({ status: EthTxStatus.Error, error: err });
        } else if (isEthereumError(err)) {
          setTransaction({
            status: EthTxStatus.Error,
            error: new EthereumError(err.message, err.code),
          });
        } else {
          setTransaction({
            status: EthTxStatus.Error,
            error: new Error('Something went wrong'),
          });
        }
      }
    },
    [performTransaction, requiredConfirmations, setTransaction]
  );

  const reset = useCallback(() => {
    setTransaction(initialState);
  }, [setTransaction]);

  return { perform, transaction, reset };
};
