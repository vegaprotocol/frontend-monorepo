import { useEffect, useState } from 'react';
import { useVegaWallet } from '../use-vega-wallet';

const cache: Record<string, string> = {};

export const useChainId = () => {
  const { vegaUrl } = useVegaWallet();
  const [chainId, setChainId] = useState<undefined | string>(cache[vegaUrl]);
  const [fetchAttempt, setFetchAttempt] = useState(1);
  useEffect(() => {
    let isCancelled = false;
    if (cache[vegaUrl]) {
      setChainId(cache[vegaUrl]);
      return;
    }
    fetch(vegaUrl.replace('graphql', 'statistics'))
      .then((response) => response.json())
      .then((response) => {
        if (isCancelled) {
          return;
        }
        if (!response?.statistics?.chainId) {
          throw new Error('statistics.chainId not present in fetched response');
        }
        setChainId(response?.statistics?.chainId);
      })
      .catch(() => {
        if (fetchAttempt < 3) {
          setFetchAttempt((value) => (value += 1));
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [fetchAttempt, vegaUrl]);
  return chainId;
};
