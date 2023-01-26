import compact from 'lodash/compact';
import shuffle from 'lodash/shuffle';
import type { createClient } from '@vegaprotocol/apollo-client';
import { useEffect, useState } from 'react';
import type { StatisticsQuery } from '../utils/__generated__/Node';
import { StatisticsDocument } from '../utils/__generated__/Node';
import type { ClientCollection } from './use-nodes';

// How often to query other nodes
export const INTERVAL_TIME = 30 * 1000;
// Number of nodes to query against
export const NODE_SUBSET_COUNT = 5;

// Queries all nodes from the environment provider via an interval
// to calculate and return the difference between the most advanced block
// and the block height of the current node
export const useNodeHealth = (clients: ClientCollection, vegaUrl?: string) => {
  const [blockDiff, setBlockDiff] = useState(10);

  useEffect(() => {
    if (!clients || !vegaUrl) return;

    const fetchBlockHeight = async (
      client?: ReturnType<typeof createClient>
    ) => {
      try {
        const result = await client?.query<StatisticsQuery>({
          query: StatisticsDocument,
          fetchPolicy: 'no-cache', // always fetch and never cache
        });

        if (!result) return null;
        if (result.error) return null;
        return result;
      } catch {
        return null;
      }
    };

    const getBlockHeights = async () => {
      const nodes = Object.keys(clients).filter((key) => key !== vegaUrl);
      // make sure that your current vega url is always included
      // so we can compare later
      const testNodes = [vegaUrl, ...randomSubset(nodes, NODE_SUBSET_COUNT)];
      const result = await Promise.all(
        testNodes.map((node) => fetchBlockHeight(clients[node]))
      );
      const blockHeights: { [node: string]: number | null } = {};
      testNodes.forEach((node, i) => {
        const data = result[i];
        const blockHeight = data
          ? Number(data?.data.statistics.blockHeight)
          : null;
        blockHeights[node] = blockHeight;
      });
      return blockHeights;
    };

    // Every INTERVAL_TIME get block heights of a random subset
    // of nodes and determine if your current node is falling behind
    const interval = setInterval(async () => {
      const blockHeights = await getBlockHeights();
      const highestBlock = Math.max.apply(
        null,
        compact(Object.values(blockHeights))
      );
      const currNodeBlock = blockHeights[vegaUrl];

      if (!currNodeBlock) {
        // Block height query failed and null was returned
        setBlockDiff(-1);
      } else {
        setBlockDiff(highestBlock - currNodeBlock);
      }
    }, INTERVAL_TIME);

    return () => {
      clearInterval(interval);
    };
  }, [clients, vegaUrl]);

  return blockDiff;
};

const randomSubset = (arr: string[], size: number) => {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, size);
};
