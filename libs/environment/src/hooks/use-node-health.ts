import { useMemo } from 'react';
import { useStatisticsQuery } from '../utils/__generated__/Node';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { fromISONanoSeconds } from '@vegaprotocol/react-helpers';

export const useNodeHealth = () => {
  const { blockHeight, timestamp } = useHeaderStore();
  const { data } = useStatisticsQuery({
    pollInterval: 1000,
    fetchPolicy: 'no-cache',
  });

  const blockDiff = useMemo(() => {
    if (!data?.statistics.blockHeight) {
      return null;
    }

    return Number(data.statistics.blockHeight) - blockHeight;
  }, [data, blockHeight]);

  return {
    coreBlockHeight: Number(data?.statistics.blockHeight || 0),
    coreVegaTime: fromISONanoSeconds(data?.statistics.vegaTime),
    datanodeBlockHeight: blockHeight,
    datanodeVegaTime: timestamp,
    blockDiff,
  };
};
