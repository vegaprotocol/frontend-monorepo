import { useEffect, useState } from 'react';
import { useVegaWallet } from '../use-vega-wallet';

const cache: Record<string, string> = {};

/**
 * Gets the statistics url for a given vega url.
 * Example:
 * https://graphql.example.com/graphql -> https://graphql.example.com/statistics
 */
const getNodeStatisticsUrl = (vegaUrl: string) => {
  try {
    const url = new URL(vegaUrl);
    url.pathname = 'statistics';
    return url.toString();
  } catch (err) {
    return undefined;
  }
};

export const useChainId = () => {
  const { vegaUrl } = useVegaWallet();
  const [chainId, setChainId] = useState<undefined | string>(cache[vegaUrl]);
  const [fetchAttempt, setFetchAttempt] = useState(1);

  const statisticsUrl = getNodeStatisticsUrl(vegaUrl);

  useEffect(() => {
    // abort when `/statistics` URL could not be determined
    if (!statisticsUrl) return;
    let isCancelled = false;
    if (cache[vegaUrl]) {
      setChainId(cache[vegaUrl]);
      return;
    }
    fetch(statisticsUrl)
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
  }, [fetchAttempt, statisticsUrl, vegaUrl]);
  return chainId;
};
