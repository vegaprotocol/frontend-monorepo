import { useEffect, useState } from 'react';
import type { TransactionReceipt } from '@ethersproject/providers';
import { useDefaultWeb3Provider } from './default-web3-provider';
import { useEthereumConfig } from './use-ethereum-config';

const cache: Record<string, TransactionReceipt> = {};

/**
 * Get and cache a transaction receipt. Will poll until to
 * get the latest number of confirmations until config.confirmations
 * is reached
 */
export const useTransactionReceipt = ({
  txHash,
  enabled = true,
}: {
  /* txHash of the transaction */
  txHash: string | null | undefined;
  /* enable or disable the request */
  enabled?: boolean;
}) => {
  const { config } = useEthereumConfig();
  const { provider } = useDefaultWeb3Provider();
  const [receipt, setReceipt] = useState<TransactionReceipt | undefined>(() => {
    if (!txHash) {
      return;
    }
    return cache[txHash];
  });

  useEffect(() => {
    if (!config || !provider || !txHash) return;

    let mounted = true;
    let interval: NodeJS.Timer;

    const getReceipt = async () => {
      const cachedReceipt = cache[txHash];

      if (
        cachedReceipt &&
        cachedReceipt.confirmations >= config.confirmations
      ) {
        setReceipt(cachedReceipt);
        return;
      }

      const r = await provider.getTransactionReceipt(txHash);

      if (mounted) {
        setReceipt(r);
        cache[txHash] = r;

        if (r.confirmations >= config.confirmations) {
          clearInterval(interval);
        }
      }
    };

    if (enabled) {
      getReceipt();
      interval = setInterval(getReceipt, 10000);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [provider, txHash, config, enabled]);

  return { receipt };
};
