import { useMemo } from 'react';
import { useStatisticsQuery } from '../utils/__generated__/Node';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { fromISONano } from '@vegaprotocol/react-helpers';
import { useEnvironment } from './use-environment';

export const useNodeHealth = () => {
  const { VEGA_URL } = useEnvironment();
  const headerStore = useHeaderStore();
  const headers = VEGA_URL ? headerStore[VEGA_URL] : undefined;
  const { data } = useStatisticsQuery({
    pollInterval: 1000,
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

  return {
    coreBlockHeight: data?.statistics.blockHeight
      ? Number(data?.statistics.blockHeight)
      : undefined,
    coreVegaTime: fromISONano(data?.statistics.vegaTime),
    datanodeBlockHeight: headers?.blockHeight,
    datanodeVegaTime: headers?.timestamp,
    blockDiff,
  };
};
