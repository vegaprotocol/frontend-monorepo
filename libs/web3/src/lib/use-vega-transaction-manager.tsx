import { useVegaWallet, WalletError, ClientErrors } from '@vegaprotocol/wallet';
import { useEffect, useRef } from 'react';
import { useVegaTransactionStore } from './use-vega-transaction-store';
import {
  WalletClientError,
  WalletHttpError,
} from '@vegaprotocol/wallet-client';
import { VegaTxStatus } from './types';

const orderErrorResolve = (err: Error | unknown): Error => {
  if (err instanceof WalletClientError || err instanceof WalletError) {
    return err;
  } else if (err instanceof WalletHttpError) {
    return ClientErrors.UNKNOWN;
  } else if (err instanceof TypeError) {
    return ClientErrors.NO_SERVICE;
  } else if (err instanceof Error) {
    return err;
  }
  return ClientErrors.UNKNOWN;
};

export const useVegaTransactionManager = () => {
  const { sendTx, pubKey, disconnect } = useVegaWallet();
  const processed = useRef<Set<number>>(new Set());
  const transaction = useVegaTransactionStore((state) =>
    state.transactions.find(
      (transaction) =>
        transaction?.status === VegaTxStatus.Requested &&
        !processed.current.has(transaction.id)
    )
  );
  const update = useVegaTransactionStore((state) => state.update);
  const del = useVegaTransactionStore((state) => state.delete);
  useEffect(() => {
    if (!(transaction && pubKey)) {
      return;
    }
    processed.current.add(transaction.id);
    sendTx(pubKey, transaction.body)
      .then((res) => {
        if (res === null) {
          // User rejected
          del(transaction.id);
          return;
        }
        if (res.signature && res.transactionHash) {
          update(transaction.id, {
            status: VegaTxStatus.Pending,
            txHash: res.transactionHash,
            signature: res.signature,
          });
        }
      })
      .catch((err) => {
        const error = orderErrorResolve(err);
        if ((error as WalletError).code === ClientErrors.NO_SERVICE.code) {
          disconnect();
        }
        update(transaction.id, {
          error,
          status: VegaTxStatus.Error,
        });
      });
  }, [transaction, pubKey, del, sendTx, update, disconnect]);
};
