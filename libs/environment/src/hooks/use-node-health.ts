import compact from 'lodash/compact';
import shuffle from 'lodash/shuffle';
import type { createClient } from '@vegaprotocol/apollo-client';
import { useEffect, useState } from 'react';
import type { StatisticsQuery } from '../utils/__generated__/Node';
import { StatisticsDocument } from '../utils/__generated__/Node';
import type { ClientCollection } from './use-nodes';

// How often to query other nodes
const INTERVAL_TIME = 15 * 1000;
// How many blocks behind the most advanced block that is
// deemed acceptable for "Good" status
const BLOCK_THRESHOLD = 3;
// Number of nodes to query against
const NODE_SUBSET_COUNT = 5;

const Health = {
  Good: 'Good',
  Bad: 'Bad',
  Critical: 'Critical',
} as const;

export type NodeHealth = keyof typeof Health;

// Queries all nodes from the environment provider via an interval
// to determine node health
export const useNodeHealth = (clients: ClientCollection, vegaUrl?: string) => {
  const [nodeHealth, setNodeHealth] = useState<NodeHealth>(Health.Good);

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
        if (!result.error) return null;
        return result;
      } catch {
        return null;
      }
    };

    const getBlockHeights = async () => {
      const nodes = randomSubset(Object.keys(clients), NODE_SUBSET_COUNT);
      const result = await Promise.all(
        nodes.map((node) => fetchBlockHeight(clients[node]))
      );
      const blockHeights: { [node: string]: number | null } = {};
      nodes.forEach((node, i) => {
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
        setNodeHealth(Health.Critical);
      } else if (currNodeBlock >= highestBlock - BLOCK_THRESHOLD) {
        setNodeHealth(Health.Good);
      } else {
        setNodeHealth(Health.Bad);
      }
    }, INTERVAL_TIME);

    return () => {
      clearInterval(interval);
    };
  }, [clients, vegaUrl]);

  return nodeHealth;
};

const randomSubset = (arr: string[], size: number) => {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, size);
};
