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
  bestBidPrice: '4412690058',
  bestBidVolume: '1',
  bestOfferPrice: '4812690058',
  bestOfferVolume: '3',
  bestStaticBidPrice: '4512690058',
  bestStaticBidVolume: '2',
  bestStaticOfferPrice: '4712690058',
  bestStaticOfferVolume: '4',
  indicativePrice: '0',
  indicativeVolume: '0',
  marketState: Schema.MarketState.STATE_ACTIVE,
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  marketValueProxy: '2000000',
  markPrice: '4612690058',
  midPrice: '4612690000',
  openInterest: '0',
  lastTradedPrice: '4612690000',
  priceMonitoringBounds: [
    {
      minValidPrice: '654701',
      maxValidPrice: '797323',
      trigger: {
        horizonSecs: 43200,
        probability: 0.9999999,
        auctionExtensionSecs: 600,
        __typename: 'PriceMonitoringTrigger',
      },
      referencePrice: '722625',
      __typename: 'PriceMonitoringBounds',
    },
  ],
  staticMidPrice: '4612690001',
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
  lastTradedPrice: '0',
  openInterest: '0',
  staticMidPrice: '0',
  trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
};
