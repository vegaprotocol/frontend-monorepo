import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  MarketDataFieldsFragment,
  MarketDataQuery,
  MarketDataUpdateFieldsFragment,
  MarketDataUpdateSubscription,
} from './__generated__/market-data';

export const marketDataQuery = (
  override?: PartialDeep<MarketDataQuery>
): MarketDataQuery => {
  const defaultResult: MarketDataQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: [
        {
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            data: Object.assign({}, marketDataFields),
          },
        },
      ],
    },
  };

  return merge(defaultResult, override);
};

export const marketDataUpdateSubscription = (
  override?: PartialDeep<MarketDataUpdateSubscription>
): MarketDataUpdateSubscription => {
  const defaultResult: MarketDataUpdateSubscription = {
    marketsData: [marketDataUpdateFields],
  };
  return merge(Object.assign({}, defaultResult), override);
};

const marketDataFields: MarketDataFieldsFragment = {
  __typename: 'MarketData',
  market: {
    id: 'market-0',
    __typename: 'Market',
  },
  auctionEnd: '2022-06-21T17:18:43.484055236Z',
  auctionStart: '2022-06-21T17:18:43.484055236Z',
  bestBidPrice: '0',
  bestBidVolume: '0',
  bestOfferPrice: '0',
  bestOfferVolume: '0',
  bestStaticBidPrice: '0',
  bestStaticBidVolume: '0',
  bestStaticOfferPrice: '0',
  bestStaticOfferVolume: '0',
  indicativePrice: '0',
  indicativeVolume: '0',
  marketState: Schema.MarketState.STATE_ACTIVE,
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  marketValueProxy: '',
  markPrice: '4612690058',
  midPrice: '0',
  openInterest: '0',
  staticMidPrice: '0',
  suppliedStake: '1000',
  targetStake: '1000000',
  trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
};

const marketDataUpdateFields: MarketDataUpdateFieldsFragment = {
  bestBidPrice: '0',
  bestBidVolume: '0',
  bestOfferPrice: '0',
  bestOfferVolume: '0',
  bestStaticBidPrice: '0',
  bestStaticBidVolume: '0',
  bestStaticOfferPrice: '0',
  bestStaticOfferVolume: '0',
  indicativePrice: '0',
  indicativeVolume: '0',
  marketId: 'market-0',
  marketState: Schema.MarketState.STATE_ACTIVE,
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  marketValueProxy: '',
  markPrice: '4612690058',
  midPrice: '0',
  openInterest: '0',
  staticMidPrice: '0',
  trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
};
