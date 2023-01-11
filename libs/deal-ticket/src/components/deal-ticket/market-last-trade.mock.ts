import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { MarketLastTradeQuery } from './__generated__/market-last-trade';

export function marketLastTradeQuery(
  override?: PartialDeep<MarketLastTradeQuery>
): MarketLastTradeQuery {
  const defaultMarketLastTrade: MarketLastTradeQuery = {
    market: {
      __typename: 'Market',
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '100',
        },
      },
    },
  };
  return merge(defaultMarketLastTrade, override);
}
