import { createClient } from '@vegaprotocol/apollo-client';
import { useEnvironment } from '@vegaprotocol/environment';
import { useBlockInfo } from '@vegaprotocol/tendermint';
import { useEffect, useMemo, useState } from 'react';
import {
  BlockStatisticsDocument,
  type BlockStatisticsQuery,
} from './__generated__/BlockStatistics';
import compact from 'lodash/compact';
import max from 'lodash/max';

const CHECK_INTERVAL = 5000; // ms

/**
 * Allows stale block height for given number of times. If stale count is
 * greater than this number then it is marked as not rising (producing blocks).
 */
const ALLOW_STALE = 2; // times -> MAX(this, 1) * CHECK_INTERVAL ~> min check time

export const useBlockRising = (skip = false) => {
  const [blocksRising, setBlocksRising] = useState(true);
  const [block, setBlock] = useState(0);
  const nodes = useEnvironment((state) => state.nodes);
  const clients = useMemo(() => {
    return nodes.map((n) => {
      if (n && n.length > 0) {
        const client = createClient({
          url: n,
          cacheConfig: undefined,
          retry: false,
          connectToDevTools: false,
          connectToHeaderStore: true,
        });
        return client;
      }
      return undefined;
    });
  }, [nodes]);

  const { refetch: fetchBlockInfo } = useBlockInfo();
  useEffect(() => {
    if (skip) return;
    let stale = 0;
    let prev = 0;
    const check = async () => {
      const queries = clients.map((client) =>
        client
          ? client
              .query<BlockStatisticsQuery>({
                query: BlockStatisticsDocument,
                fetchPolicy: 'network-only',
                errorPolicy: 'ignore',
              })
              .catch(() => {
                // NOOP - could not retrieve statistics for that node (network error)
              })
          : undefined
      );

      const blockInfo = await fetchBlockInfo();
      const results = (await Promise.allSettled(compact(queries))).map(
        (res) => {
          if (res && res.status === 'fulfilled' && res.value) {
            return res.value.data.statistics;
          } else {
            return undefined;
          }
        }
      );

      const heights = compact([
        ...results.map((r) => r?.blockHeight),
        blockInfo?.result.block.header.height,
      ]);
      const current = max(heights);
      if (current && Number(current) > prev) {
        setBlock(Number(current));
        prev = Number(current);
        stale = 0;
        if (!blocksRising) setBlocksRising(true);
      } else {
        if (stale > ALLOW_STALE) setBlocksRising(false);
        stale++;
      }
    };
    const interval = setInterval(check, CHECK_INTERVAL);
    check();
    return () => {
      clearInterval(interval);
    };
  }, [clients, fetchBlockInfo, blocksRising, nodes, skip]);

  return { blocksRising, block };
};
