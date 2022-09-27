import { makeDerivedDataProvider } from '@vegaprotocol/react-helpers';

import type { MarketItemFieldsFragment } from './__generated__/Markets';
import { marketsProvider } from './markets-provider';

export const marketProvider = makeDerivedDataProvider<
  MarketItemFieldsFragment,
  never
>(
  [(callback, client) => marketsProvider(callback, client)], // omit variables param
  ([markets], variables) => {
    if (markets) {
      const market = (markets as MarketItemFieldsFragment[]).find(
        (market) => market.id === variables?.['marketId']
      );
      if (market) {
        return market;
      }
    }
    return null;
  }
);
