import { makeDerivedDataProvider } from '@vegaprotocol/react-helpers';

import type { Market } from './';
import { marketsDataProvider } from './';

export const marketDataProvider = makeDerivedDataProvider<Market>(
  [(callback, client, variables) => marketsDataProvider(callback, client)],
  ([markets], variables) =>
    (markets &&
      (markets as Market[]).find(
        (market) => market.id === variables?.marketId
      )) ||
    null
);
