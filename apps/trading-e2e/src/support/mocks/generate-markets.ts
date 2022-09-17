import merge from 'lodash/merge';
import { Schema, MarketTradingMode } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  MarketListQuery,
  MarketListItemFragment,
  MarketsCandlesQuery,
  MarketItemFieldsFragment,
  MarketsDataQuery,
  MarketDataFieldsFragment,
} from '@vegaprotocol/market-list';

export const generateMarkets = (
  override?: PartialDeep<MarketListQuery>
): MarketListQuery => {
  const markets: MarketListItemFragment[] = [
    {
      id: 'market-0',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      state: Schema.MarketState.STATE_ACTIVE,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '',
        open: '',
      },
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '',
          infrastructureFee: '',
          liquidityFee: '',
        },
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
      state: Schema.MarketState.STATE_ACTIVE,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '',
        open: '',
      },
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '',
          infrastructureFee: '',
          liquidityFee: '',
        },
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
      state: Schema.MarketState.STATE_SUSPENDED,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '2022-08-26T11:36:32.252490405Z',
        open: null,
      },
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.001',
        },
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
      state: Schema.MarketState.STATE_ACTIVE,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '2022-08-26T11:36:32.252490405Z',
        open: null,
      },
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.001',
        },
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

  const defaultResult: MarketListQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((node) => ({
        __typename: 'MarketEdge',
        node,
      })),
    },
  };

  return merge(defaultResult, override);
};

export const generateMarketsData = (
  override?: PartialDeep<MarketsDataQuery>
): MarketsDataQuery => {
  const markets: MarketDataFieldsFragment[] = [
    {
      market: {
        id: 'market-0',
        state: Schema.MarketState.STATE_ACTIVE,
        tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
        __typename: 'Market',
      },
      marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
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
    },
    {
      market: {
        id: 'market-1',
        state: Schema.MarketState.STATE_ACTIVE,
        tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
        __typename: 'Market',
      },
      marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      staticMidPrice: '0',
      indicativePrice: '0',
      bestStaticBidPrice: '0',
      bestStaticOfferPrice: '0',
      indicativeVolume: '0',
      bestBidPrice: '0',
      bestOfferPrice: '0',
      markPrice: '8441',
      trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
      __typename: 'MarketData',
    },
    {
      market: {
        id: 'market-2',
        state: Schema.MarketState.STATE_ACTIVE,
        tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
        __typename: 'Market',
      },
      marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      staticMidPrice: '0',
      indicativePrice: '0',
      bestStaticBidPrice: '0',
      bestStaticOfferPrice: '0',
      indicativeVolume: '0',
      bestBidPrice: '0',
      bestOfferPrice: '0',
      markPrice: '4612690058',
      trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY,
      __typename: 'MarketData',
    },
    {
      market: {
        id: 'market-3',
        state: Schema.MarketState.STATE_ACTIVE,
        tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
        __typename: 'Market',
      },
      marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      staticMidPrice: '0',
      indicativePrice: '0',
      bestStaticBidPrice: '0',
      bestStaticOfferPrice: '0',
      indicativeVolume: '0',
      bestBidPrice: '0',
      bestOfferPrice: '0',
      markPrice: '4612690058',
      trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY,
      __typename: 'MarketData',
    },
  ];

  const defaultResult: MarketsDataQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((data) => ({
        __typename: 'MarketEdge',
        node: {
          data,
          __typename: 'Market',
        },
      })),
    },
  };

  return merge(defaultResult, override);
};

export const generateMarketsCandles = (
  override?: PartialDeep<MarketsCandlesQuery>
): MarketsCandlesQuery => {
  const markets: MarketItemFieldsFragment[] = [
    {
      __typename: 'Market',
      id: 'market-0',
      candlesConnection: {
        __typename: 'CandleDataConnection',
        edges: [
          {
            __typename: 'CandleEdge',
            node: {
              __typename: 'CandleNode',
              open: '100',
              close: '100',
              high: '110',
              low: '90',
              volume: '1',
            },
          },
        ],
      },
    },
    {
      __typename: 'Market',
      id: 'market-1',
      candlesConnection: {
        __typename: 'CandleDataConnection',
        edges: [
          {
            __typename: 'CandleEdge',
            node: {
              __typename: 'CandleNode',
              open: '100',
              close: '100',
              high: '110',
              low: '90',
              volume: '1',
            },
          },
        ],
      },
    },
    {
      __typename: 'Market',
      id: 'market-2',
      candlesConnection: {
        __typename: 'CandleDataConnection',
        edges: [
          {
            __typename: 'CandleEdge',
            node: {
              __typename: 'CandleNode',
              open: '100',
              close: '100',
              high: '110',
              low: '90',
              volume: '1',
            },
          },
        ],
      },
    },
    {
      __typename: 'Market',
      id: 'market-3',
      candlesConnection: {
        __typename: 'CandleDataConnection',
        edges: [
          {
            __typename: 'CandleEdge',
            node: {
              __typename: 'CandleNode',
              open: '100',
              close: '100',
              high: '110',
              low: '90',
              volume: '1',
            },
          },
        ],
      },
    },
  ];
  const defaultResult: MarketsCandlesQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((node) => ({
        __typename: 'MarketEdge',
        node,
      })),
    },
  };

  return merge(defaultResult, override);
};
