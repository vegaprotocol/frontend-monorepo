import { useEffect, useState } from 'react';

export const MAX_FETCH_ATTEMPTS = 3;

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

export const useChainId = (vegaUrl: string | undefined) => {
  const [chainId, setChainId] = useState<undefined | string>(
    vegaUrl ? cache[vegaUrl] : undefined
  );
  const [fetchAttempts, setFetchAttempts] = useState(1);

  const statisticsUrl = vegaUrl ? getNodeStatisticsUrl(vegaUrl) : undefined;

  useEffect(() => {
    // abort when `/statistics` URL could not be determined
    if (!statisticsUrl || !vegaUrl) return;
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

        const chainId = response.statistics.chainId;
        cache[vegaUrl] = chainId;
        setChainId(chainId);
      })
      .catch(() => {
        if (fetchAttempts < MAX_FETCH_ATTEMPTS) {
          setFetchAttempts((value) => (value += 1));
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [fetchAttempts, statisticsUrl, vegaUrl]);
  return chainId;
};
