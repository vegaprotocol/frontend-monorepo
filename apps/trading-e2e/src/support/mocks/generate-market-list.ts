import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { MarketList, MarketList_markets } from '@vegaprotocol/market-list';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';

export const generateMarketList = (
  override?: PartialDeep<MarketList>
): MarketList => {
  const markets: MarketList_markets[] = [
    {
      id: 'market-0',
      name: 'BTCUSD Monthly (30 Jun 2022)',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      state: MarketState.STATE_ACTIVE,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      fees: {
        factors: {
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.001',
          __typename: 'FeeFactors',
        },
        __typename: 'Fees',
      },
      data: {
        market: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          state: MarketState.STATE_ACTIVE,
          tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'Market',
        },
        bestBidPrice: '2411432389',
        bestOfferPrice: '2346732714',
        markPrice: '4612690058',
        trigger: AuctionTrigger.AUCTION_TRIGGER_PRICE,
        indicativeVolume: '1216',
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          id: 'BTCUSD.MF21',
          name: 'BTC/USD Monthly',
          code: 'BTCUSD.MF21',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: ['tag1'],
          },
          product: {
            settlementAsset: {
              symbol: 'tBTC',
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '2022-08-12T09:57:02.420419276Z',
        close: '',
      },
      candles: [
        {
          __typename: 'Candle',
          open: '100',
          close: '100',
          high: '110',
          low: '90',
        },
      ],
      __typename: 'Market',
    },
    {
      id: 'market-1',
      name: 'SOL/USD',
      decimalPlaces: 2,
      positionDecimalPlaces: 0,
      state: MarketState.STATE_SUSPENDED,
      tradingMode: MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      data: {
        market: {
          id: '34d95e10faa00c21d19d382d6d7e6fc9722a96985369f0caec041b0f44b775ed',
          state: MarketState.STATE_SUSPENDED,
          tradingMode: MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
          __typename: 'Market',
        },
        bestBidPrice: '17065127',
        bestOfferPrice: '17017654',
        markPrice: '8441',
        indicativeVolume: '249',
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          id: 'SOLUSD',
          name: 'SOL/USD',
          code: 'SOLUSD',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: ['tag1'],
          },
          product: {
            settlementAsset: {
              symbol: 'SOLUSD',
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '',
        close: '',
      },
      candles: [
        {
          __typename: 'Candle',
          open: '100',
          close: '100',
          high: '110',
          low: '90',
        },
      ],
      __typename: 'Market',
    },
  ];
  const defaultResult = {
    markets,
  };

  return merge(defaultResult, override);
};
