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

type DefaultContract = {
  contract: ethers.Contract;
};

export const useEthereumTransaction = <
  TContract extends DefaultContract,
  TMethod extends string
>(
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
    // @ts-ignore TS errors here as TMethod doesn satisifed the constraints on TContract
    async (...args: Parameters<TContract[TMethod]>) => {
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

      setTransaction({
        status: EthTxStatus.Requested,
        error: null,
        confirmations: 0,
      });

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
