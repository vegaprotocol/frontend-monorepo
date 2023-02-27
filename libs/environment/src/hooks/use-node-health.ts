import { useEffect, useMemo } from 'react';
import { useStatisticsQuery } from '../utils/__generated__/Node';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { useEnvironment } from './use-environment';
import { fromNanoSeconds } from '@vegaprotocol/react-helpers';

const POLL_INTERVAL = 1000;

export const useNodeHealth = () => {
  const url = useEnvironment((store) => store.VEGA_URL);
  const headerStore = useHeaderStore();
  const headers = url ? headerStore[url] : undefined;
  const { data, error, loading, startPolling, stopPolling } =
    useStatisticsQuery({
      fetchPolicy: 'no-cache',
    });

  const blockDiff = useMemo(() => {
    if (!data?.statistics.blockHeight) {
      return null;
    }

    if (!headers) {
      return 0;
    }

    return Number(data.statistics.blockHeight) - headers.blockHeight;
  }, [data, headers]);

  useEffect(() => {
    if (error) {
      stopPolling();
      return;
    }

    if (!('Cypress' in window)) {
      startPolling(POLL_INTERVAL);
    }
  }, [error, startPolling, stopPolling]);

  return {
    error,
    loading,
    coreBlockHeight: data?.statistics
      ? Number(data.statistics.blockHeight)
      : undefined,
    coreVegaTime: data?.statistics
      ? fromNanoSeconds(data?.statistics.vegaTime)
      : undefined,
    datanodeBlockHeight: headers?.blockHeight,
    datanodeVegaTime: headers?.timestamp,
    blockDiff,
  };
};
