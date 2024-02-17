import {
  useDisconnect,
  useSendTransaction,
  useVegaWallet,
} from '@vegaprotocol/wallet-react';
import { ConnectorError, ConnectorErrors } from '@vegaprotocol/wallet';
import { useEffect, useRef } from 'react';
import { useVegaTransactionStore } from './use-vega-transaction-store';
import { VegaTxStatus } from './types';

export const useVegaTransactionManager = () => {
  const { pubKey } = useVegaWallet();
  const { disconnect } = useDisconnect();
  const { sendTransaction } = useSendTransaction();

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

    sendTransaction({
      publicKey: pubKey,
      sendingMode: 'TYPE_SYNC',
      transaction: transaction.body,
    })
      .then((res) => {
        if (!res) {
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
        if (
          err instanceof ConnectorError &&
          err.code === ConnectorErrors.noWallet.code
        ) {
          disconnect();
        }

        update(transaction.id, {
          error:
            err instanceof ConnectorError
              ? new Error(err.message)
              : new Error('something went wrong'),
          status: VegaTxStatus.Error,
        });
      });
  }, [transaction, pubKey, del, sendTransaction, update, disconnect]);
};
