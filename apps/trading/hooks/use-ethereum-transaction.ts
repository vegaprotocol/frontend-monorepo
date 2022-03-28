import { ethers } from 'ethers';
import { useCallback, useState } from 'react';

export enum TxState {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
}

export const useEthereumTransaction = (
  // eslint-disable-next-line
  func: (...args: any) => Promise<ethers.ContractTransaction> | null,
  requiredConfirmations = 1
) => {
  const [confirmations, setConfirmations] = useState(0);
  const [status, setStatus] = useState(TxState.Default);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const perform = useCallback(
    // eslint-disable-next-line
    async (...args: any) => {
      setConfirmations(0);
      setStatus(TxState.Requested);

      try {
        const res = func(...args);

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
    [func, requiredConfirmations]
  );

  return { perform, status, error, confirmations, txHash };
};
