import merge from 'lodash/merge';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { MarketList, MarketList_markets } from '@vegaprotocol/market-list';

export const generateMarkets = (
  override?: PartialDeep<MarketList>
): MarketList => {
  const markets: MarketList_markets[] = [
    {
      id: 'market-0',
      name: 'ACTIVE MARKET',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      tradingMode: MarketTradingMode.Continuous,
      state: MarketState.Active,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '',
        open: '',
      },
      candles: [],
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '',
          infrastructureFee: '',
          liquidityFee: '',
        },
      },
      data: {
        market: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          state: MarketState.Active,
          tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'Market',
        },
        indicativeVolume: '0',
        bestBidPrice: '0',
        bestOfferPrice: '0',
        markPrice: '4612690058',
        trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          code: 'BTCUSD.MF21',
          name: '',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: [],
          },
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
      positionDecimalPlaces: 0,
      tradingMode: MarketTradingMode.Continuous,
      state: MarketState.Active,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '',
        open: '',
      },
      candles: [],
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '',
          infrastructureFee: '',
          liquidityFee: '',
        },
      },
      data: {
        market: {
          id: '34d95e10faa00c21d19d382d6d7e6fc9722a96985369f0caec041b0f44b775ed',
          state: MarketState.STATE_SUSPENDED,
          tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'Market',
        },
        bestBidPrice: '0',
        bestOfferPrice: '0',
        indicativeVolume: '0',
        markPrice: '8441',
        trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          code: 'SOLUSD',
          name: '',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: [],
          },
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
