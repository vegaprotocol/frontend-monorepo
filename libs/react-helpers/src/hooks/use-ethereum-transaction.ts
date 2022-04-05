import type { ethers } from 'ethers';
import { useCallback, useState } from 'react';

export enum TxState {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
}

export type TxError = Error | EthereumError;

export const useEthereumTransaction = <TArgs = void>(
  performTransaction: (
    args: TArgs
  ) => Promise<ethers.ContractTransaction> | null,
  requiredConfirmations = 1
) => {
  const [confirmations, setConfirmations] = useState(0);
  const [status, setStatus] = useState(TxState.Default);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<TxError | null>(null);

  const perform = useCallback(
    async (args: TArgs) => {
      setConfirmations(0);
      setStatus(TxState.Requested);
      setError(null);

      try {
        const res = performTransaction(args);

        if (res === null) {
          setStatus(TxState.Default);
          return;
        }

        const tx = await res;

        let receipt: ethers.ContractReceipt | null = null;

        setTxHash(tx.hash);
        setStatus(TxState.Pending);

        for (let i = 1; i <= requiredConfirmations; i++) {
          receipt = await tx.wait(i);
          setConfirmations(receipt.confirmations);
        }

        if (!receipt) {
          throw new Error('No receipt after confirmations are met');
        }

        setStatus(TxState.Complete);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else if (isEthereumError(err)) {
          setError(new EthereumError(err.message, err.code));
        } else {
          setError(new Error('Something went wrong'));
        }
        setStatus(TxState.Error);
      }
    },
    [performTransaction, requiredConfirmations]
  );

  return { perform, status, error, confirmations, txHash };
};

export class EthereumError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = 'EthereumError';
  }
}

export const isEthereumError = (err: unknown): err is EthereumError => {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return true;
  }
  return false;
};
