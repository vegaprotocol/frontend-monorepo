import { makeDerivedDataProvider } from '@vegaprotocol/react-helpers';

import type { MarketListItemFragment } from './__generated__/MarketList';
import { marketsProvider } from './markets-provider';

export const marketProvider = makeDerivedDataProvider<MarketListItemFragment>(
  [(callback, client) => marketsProvider(callback, client)], // omit variables param
  ([markets], variables) => {
    if (markets) {
      const market = (markets as MarketListItemFragment[]).find(
        (market) => market.id === variables?.marketId
      );
      if (market) {
        return market;
      }
    }
    return null;
  }
);
