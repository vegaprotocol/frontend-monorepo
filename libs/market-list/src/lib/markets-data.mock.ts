import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  MarketsDataQuery,
  MarketsDataFieldsFragment,
} from './__generated__/markets-data';

export const marketsDataQuery = (
  override?: PartialDeep<MarketsDataQuery>
): MarketsDataQuery => {
  const defaultResult: MarketsDataQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: marketsDataFieldsFragments.map((data) => ({
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          data,
        },
      })),
    },
  };

  return merge(defaultResult, override);
};

export const createMarketsDataFragment = (
  override?: PartialDeep<MarketsDataFieldsFragment>
): MarketsDataFieldsFragment => {
  const defaultResult = {
    market: {
      id: 'market-0',
      __typename: 'Market',
    },
    marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    staticMidPrice: '0',
    indicativePrice: '0',
    bestStaticBidPrice: '0',
    bestStaticOfferPrice: '0',
    indicativeVolume: '0',
    bestBidPrice: '0',
    bestOfferPrice: '0',
    markPrice: '4612690058',
    trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
    __typename: 'MarketData',
  };
  return merge(defaultResult, override);
};

const marketsDataFieldsFragments: MarketsDataFieldsFragment[] = [
  createMarketsDataFragment(),
  createMarketsDataFragment({
    market: {
      id: 'market-1',
    },
    markPrice: '8441',
  }),
  createMarketsDataFragment({
    market: {
      id: 'market-2',
    },
    trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET,
  }),
  createMarketsDataFragment({
    market: {
      id: 'market-3',
    },
    trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET,
  }),
];
