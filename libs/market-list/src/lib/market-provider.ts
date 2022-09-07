import { makeDerivedDataProvider } from '@vegaprotocol/react-helpers';

import type { Market } from './';
import { marketsProvider } from './';

export const marketProvider = makeDerivedDataProvider<Market>(
  [(callback, client, variables) => marketsProvider(callback, client)],
  ([markets], variables) =>
    (markets &&
      (markets as Market[]).find(
        (market) => market.id === variables?.marketId
      )) ||
    null
);
