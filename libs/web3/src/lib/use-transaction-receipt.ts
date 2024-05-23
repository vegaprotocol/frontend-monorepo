import { useEffect, useState } from 'react';
import { type TransactionReceipt } from '@ethersproject/providers';
import { useDefaultWeb3Provider } from './default-web3-provider';

/**
 * Get and poll a transaction receipt until a certain number
 * of confirmations have been reached
 */
export const useTransactionReceipt = ({
  txHash,
  enabled = true,
  confirmations = 1,
}: {
  /* txHash of the transaction */
  txHash: string | null | undefined;
  /* enable or disable the request */
  enabled?: boolean;
  /* number of confirmations at which point polling will stop */
  confirmations?: number;
}) => {
  const { provider } = useDefaultWeb3Provider();
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  useEffect(() => {
    if (!provider || !txHash) return;

    let mounted = true;
    let interval: NodeJS.Timer;

    const getReceipt = async () => {
      const r = await provider.getTransactionReceipt(txHash);

      if (mounted) {
        setReceipt(r);

        if (r.confirmations >= confirmations) {
          clearInterval(interval);
        }
      }
    };

    if (enabled) {
      getReceipt();

      interval = setInterval(() => {
        getReceipt();
      }, 10000);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [provider, txHash, confirmations, enabled]);

  return { receipt };
};
