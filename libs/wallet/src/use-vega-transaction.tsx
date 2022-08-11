import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { TransactionSubmission } from './wallet-types';
import { useVegaWallet } from './use-vega-wallet';
import { VegaTransactionDialog } from './vega-transaction-dialog';
import type { Intent } from '@vegaprotocol/ui-toolkit';

export interface DialogProps {
  children?: JSX.Element;
  intent?: Intent;
  title?: string;
  icon?: ReactNode;
}

export enum VegaTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Error = 'Error',
  Complete = 'Complete',
}

export interface VegaTxState {
  status: VegaTxStatus;
  error: string | null;
  txHash: string | null;
  signature: string | null;
  dialogOpen: boolean;
}

export const initialState = {
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

export const useVegaTransaction = () => {
  const { sendTx } = useVegaWallet();
  const [transaction, _setTransaction] = useState<VegaTxState>(initialState);

  const setTransaction = useCallback((update: Partial<VegaTxState>) => {
    _setTransaction((curr) => ({
      ...curr,
      ...update,
    }));
  }, []);

  const reset = useCallback(() => {
    setTransaction(initialState);
  }, [setTransaction]);

  const setComplete = useCallback(() => {
    setTransaction({ status: VegaTxStatus.Complete });
  }, [setTransaction]);

  const send = useCallback(
    async (tx: TransactionSubmission) => {
      setTransaction({
        error: null,
        txHash: null,
        signature: null,
        status: VegaTxStatus.Requested,
        dialogOpen: true,
      });

      const res = await sendTx(tx);

      if (res === null) {
        // User rejected
        reset();
        return;
      }

      if (isError(res)) {
        setTransaction({ error: res.error, status: VegaTxStatus.Error });
        return;
      }

      if (res.tx?.signature?.value && res.txHash) {
        setTransaction({
          status: VegaTxStatus.Pending,
          txHash: res.txHash,
          signature: res.tx.signature.value,
        });

        return {
          signature: res.tx.signature?.value,
        };
      }

      return null;
    },
    [sendTx, setTransaction, reset]
  );

  const TransactionDialog = useMemo(() => {
    return (props: DialogProps) => (
      <VegaTransactionDialog
        {...props}
        isOpen={transaction.dialogOpen}
        onChange={(isOpen) => {
          if (!isOpen) reset();
          setTransaction({ dialogOpen: isOpen });
        }}
        transaction={transaction}
      />
    );
  }, [transaction, setTransaction, reset]);

  return {
    send,
    transaction,
    reset,
    setComplete,
    TransactionDialog,
  };
};

const isError = (error: unknown): error is { error: string } => {
  if (error !== null && typeof error === 'object' && 'error' in error) {
    return true;
  }
  return false;
};
