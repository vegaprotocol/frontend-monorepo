import type { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import type { EthereumError } from './ethereum-error';
import { isEthereumError } from './ethereum-error';

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

export const initialState = {
  status: EthTxStatus.Default,
  error: null,
  txHash: null,
  receipt: null,
  confirmations: 0,
};

export const useEthereumTransaction = <TContract>(
  contract: TContract | null,
  methodName: keyof TContract,
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
    async (...args) => {
      if (!contract || typeof contract[methodName] !== 'function') {
        throw new Error('Method not found on contract');
      }

      try {
        // @ts-ignore asdf asdf asdf
        await contract.contract.callStatic[methodName](...args);
      } catch (err) {
        // call static failed
        setTransaction({
          status: EthTxStatus.Error,
          // @ts-ignore asdf asdf asdf
          error: err,
        });
        return;
      }

      setTransaction({
        status: EthTxStatus.Requested,
        error: null,
        confirmations: 0,
      });

      try {
        // @ts-ignore asdf asdf asdf
        const res = contract[methodName](...args);

        if (res === null) {
          setTransaction({ status: EthTxStatus.Default });
          return;
        }

        const tx = await res;

        let receipt: ethers.ContractReceipt | null = null;

        setTransaction({ status: EthTxStatus.Pending, txHash: tx.hash });

        for (let i = 1; i <= requiredConfirmations; i++) {
          receipt = await tx.wait(i);
          // @ts-ignore lost type safety on contract
          setTransaction({ confirmations: receipt.confirmations });
        }

        if (!receipt) {
          throw new Error('No receipt after confirmations are met');
        }

        setTransaction({ status: EthTxStatus.Complete, receipt });
      } catch (err) {
        if (err instanceof Error || isEthereumError(err)) {
          setTransaction({ status: EthTxStatus.Error, error: err });
        } else {
          setTransaction({
            status: EthTxStatus.Error,
            error: new Error('Something went wrong'),
          });
        }
      }
    },
    [contract, methodName, requiredConfirmations, setTransaction]
  );

  const reset = useCallback(() => {
    setTransaction(initialState);
  }, [setTransaction]);

  return { perform, transaction, reset };
};
