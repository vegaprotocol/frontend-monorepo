import { makeDerivedDataProvider } from '@vegaprotocol/react-helpers';

import type { Markets_marketsConnection_edges_node } from './';
import { marketsDataProvider } from './';

export const marketDataProvider =
  makeDerivedDataProvider<Markets_marketsConnection_edges_node>(
    [(callback, client, variables) => marketsDataProvider(callback, client)],
    ([markets], variables) =>
      (markets &&
        (markets as Markets_marketsConnection_edges_node[]).find(
          (market) => market.id === variables?.marketId
        )) ||
      null
  );
