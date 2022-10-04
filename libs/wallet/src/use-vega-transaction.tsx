import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useVegaWallet } from './use-vega-wallet';
import { VegaTransactionDialog } from './vega-transaction-dialog';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import type { Transaction } from './connectors';
import { ClientErrors } from './connectors';
import { WalletError } from './connectors';

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
  error: WalletError | null;
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
    async (pubKey: string, tx: Transaction) => {
      try {
        setTransaction({
          error: null,
          txHash: null,
          signature: null,
          status: VegaTxStatus.Requested,
          dialogOpen: true,
        });

        const res = await sendTx(pubKey, tx);

        if (res === null) {
          // User rejected
          reset();
          return null;
        }

        if (res.signature && res.transactionHash) {
          setTransaction({
            status: VegaTxStatus.Pending,
            txHash: res.transactionHash,
            signature: res.signature,
          });

          return res;
        }

        return null;
      } catch (err) {
        setTransaction({
          error: err instanceof WalletError ? err : ClientErrors.UNKNOWN,
          status: VegaTxStatus.Error,
        });
        return null;
      }
    },
    [sendTx, setTransaction, reset]
  );

  const Dialog = useMemo(() => {
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
    setTransaction,
    Dialog,
  };
};
