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
      decimalPlaces: 5,
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
          __typename: 'Market',
          state: MarketState.Active,
          tradingMode: MarketTradingMode.Continuous,
        },
        markPrice: '4612690058',
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
    {
      id: 'market-1',
      decimalPlaces: 2,
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
          __typename: 'Market',
          state: MarketState.Suspended,
          tradingMode: MarketTradingMode.MonitoringAuction,
        },
        markPrice: '8441',
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
