import merge from 'lodash/merge';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { Markets, Markets_markets } from '@vegaprotocol/market-list';

export const generateMarkets = (override?: PartialDeep<Markets>): Markets => {
  const markets: Markets_markets[] = [
    {
      id: 'market-0',
      name: 'ACTIVE MARKET',
      decimalPlaces: 5,
      data: {
        market: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          state: MarketState.STATE_ACTIVE,
          tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'Market',
        },
        bestBidPrice: '0',
        bestOfferPrice: '0',
        markPrice: '4612690058',
        trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          code: 'BTCUSD.MF21',
          product: {
            settlementAsset: {
              symbol: 'tDAI',
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      id: 'market-1',
      name: 'SUSPENDED MARKET',
      decimalPlaces: 2,
      data: {
        market: {
          id: '34d95e10faa00c21d19d382d6d7e6fc9722a96985369f0caec041b0f44b775ed',
          state: MarketState.STATE_SUSPENDED,
          tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'Market',
        },
        bestBidPrice: '0',
        bestOfferPrice: '0',
        markPrice: '8441',
        trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          code: 'SOLUSD',
          product: {
            settlementAsset: {
              symbol: 'XYZalpha',
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
  ];
  const defaultResult = {
    markets,
  };

  return merge(defaultResult, override);
};
