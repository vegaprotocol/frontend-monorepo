import { useVegaWallet } from './use-vega-wallet';
import { useEffect, useRef } from 'react';
import type { WalletError } from './connectors';
import { ClientErrors } from './connectors';
import { VegaTxStatus, orderErrorResolve } from './use-vega-transaction';
import { useVegaTransactionStore } from './use-vega-transaction-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  // put it temporary here, sorry :-(
  return this.toString();
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
        console.log('error', error, err.toString());
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
