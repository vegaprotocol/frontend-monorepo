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
      state: MarketState.Active,
      tradingMode: MarketTradingMode.Continuous,
      positionDecimalPlaces: 2,
      name: 'Market 0',
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.001',
          liquidityFee: '0.001',
          infrastructureFee: '0.001',
        },
      },
      data: {
        market: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          state: MarketState.Active,
          tradingMode: MarketTradingMode.Continuous,
          __typename: 'Market',
          state: MarketState.Active,
          tradingMode: MarketTradingMode.Continuous,
        },
        bestBidPrice: '2411432389',
        bestOfferPrice: '2346732714',
        markPrice: '4612690058',
        trigger: AuctionTrigger.Price,
        indicativeVolume: '1216',
        __typename: 'MarketData',
        bestBidPrice: '4612690058',
        bestOfferPrice: '4612690058',
        trigger: AuctionTrigger.Liquidity,
        indicativeVolume: '0',
      },
      tradableInstrument: {
        instrument: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          product: {
            __typename: 'Future',
            settlementAsset: {
              __typename: 'Asset',
              symbol: 'ETH',
            },
          },
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
          high: '100',
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
      state: MarketState.Suspended,
      tradingMode: MarketTradingMode.MonitoringAuction,
      name: 'BTC/USD Monthly',
      positionDecimalPlaces: 2,
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.001',
          liquidityFee: '0.001',
          infrastructureFee: '0.001',
        },
      },
      data: {
        market: {
          id: '34d95e10faa00c21d19d382d6d7e6fc9722a96985369f0caec041b0f44b775ed',
          state: MarketState.Suspended,
          tradingMode: MarketTradingMode.MonitoringAuction,
          __typename: 'Market',
          state: MarketState.Suspended,
          tradingMode: MarketTradingMode.MonitoringAuction,
        },
        bestBidPrice: '17065127',
        bestOfferPrice: '17017654',
        markPrice: '8441',
        indicativeVolume: '249',
        __typename: 'MarketData',
        bestBidPrice: '4612690058',
        bestOfferPrice: '4612690058',
        trigger: AuctionTrigger.Liquidity,

        indicativeVolume: '0',
      },
      tradableInstrument: {
        instrument: {
          product: {
            __typename: 'Future',
            settlementAsset: {
              __typename: 'Asset',
              symbol: 'ETH',
            },
          },
          name: 'SOL/USD',
          id: '34d95e10faa00c21d19d382d6d7e6fc9722a96985369f0caec041b0f44b775ed',
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
          high: '100',
          low: '100',
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
