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
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      state: MarketState.STATE_ACTIVE,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '',
        open: '',
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
          state: MarketState.STATE_ACTIVE,
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
          id: '',
          code: 'BTCUSD.MF21',
          name: 'ACTIVE MARKET',
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
      decimalPlaces: 2,
      positionDecimalPlaces: 0,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      state: MarketState.STATE_ACTIVE,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '',
        open: '',
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
          tradingMode: MarketTradingMode.TRADING_MODE_NO_TRADING,
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
          id: 'SOLUSD',
          name: 'SUSPENDED MARKET',
          code: 'SOLUSD',
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
    {
      id: 'market-2',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      tradingMode: MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      state: MarketState.STATE_SUSPENDED,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '2022-08-26T11:36:32.252490405Z',
        open: null,
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
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.001',
        },
      },
      data: {
        market: {
          id: 'a1c731af07570ca49b22a3cd253cc143dc14068edbec918e1087e69db934af5f',
          state: MarketState.STATE_SUSPENDED,
          tradingMode: MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
          __typename: 'Market',
        },
        indicativeVolume: '0',
        bestBidPrice: '0',
        bestOfferPrice: '0',
        markPrice: '4612690058',
        trigger: AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY,
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'AAPL.MF21',
          name: 'Apple Monthly (30 Jun 2022)',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: [],
          },
          product: {
            settlementAsset: {
              symbol: 'tUSDC',
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
      id: 'market-3',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      state: MarketState.STATE_ACTIVE,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '2022-08-26T11:36:32.252490405Z',
        open: null,
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
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.001',
        },
      },
      data: {
        market: {
          id: 'bebea8ec669b913a7d6a704a6d8cede164bc1376229e0d472bc6fdaa976629b2',
          state: MarketState.STATE_ACTIVE,
          tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'Market',
        },
        indicativeVolume: '0',
        bestBidPrice: '0',
        bestOfferPrice: '0',
        markPrice: '4612690058',
        trigger: AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY,
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'ETHBTC.QM21',
          name: 'ETHBTC Quarterly (30 Jun 2022)',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: [],
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
      __typename: 'Market',
    },
  ];
  const defaultResult = {
    markets,
  };

  return merge(defaultResult, override);
};
