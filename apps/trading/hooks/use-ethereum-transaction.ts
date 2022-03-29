import { ethers } from 'ethers';
import { useCallback, useState } from 'react';

export enum TxState {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
}

export const useEthereumTransaction = <TArgs = void>(
  performTransaction: (
    args: TArgs
  ) => Promise<ethers.ContractTransaction> | null,
  requiredConfirmations = 1
) => {
  const [confirmations, setConfirmations] = useState(0);
  const [status, setStatus] = useState(TxState.Default);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

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
        setStatus(TxState.Error);
        setError(
          err instanceof Error ? err : new Error('Something went wrong')
        );
      }
    },
    [performTransaction, requiredConfirmations]
  );

  return { perform, status, error, confirmations, txHash };
};
