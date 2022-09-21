import merge from 'lodash/merge';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  Markets,
  Markets_marketsConnection_edges_node,
  MarketsCandlesQuery,
  MarketsCandlesQuery_marketsConnection_edges_node,
  MarketsDataQuery,
  MarketsDataQuery_marketsConnection_edges_node,
} from '@vegaprotocol/market-list';

export const generateMarkets = (override?: PartialDeep<Markets>): Markets => {
  const markets: Markets_marketsConnection_edges_node[] = [
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
              decimals: 5,
              __typename: 'Asset',
            },
            quoteName: 'DAI',
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
              decimals: 5,
              __typename: 'Asset',
            },
            quoteName: 'USD',
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
              decimals: 5,
              __typename: 'Asset',
            },
            quoteName: 'USDC',
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
              decimals: 5,
              __typename: 'Asset',
            },
            quoteName: 'BTC',
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
  ];

  const defaultResult: Markets = {
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
  const markets: MarketsDataQuery_marketsConnection_edges_node[] = [
    {
      data: {
        market: {
          id: 'market-0',
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
        trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
    {
      data: {
        market: {
          id: 'market-1',
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
        trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
    {
      data: {
        market: {
          id: 'market-2',
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
        trigger: AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY,
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
    {
      data: {
        market: {
          id: 'market-3',
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
        trigger: AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY,
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
  ];

  const defaultResult: MarketsDataQuery = {
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

export const generateMarketsCandles = (
  override?: PartialDeep<MarketsCandlesQuery>
): MarketsCandlesQuery => {
  const markets: MarketsCandlesQuery_marketsConnection_edges_node[] = [
    {
      __typename: 'Market',
      id: 'market-0',
      candles: [
        {
          __typename: 'Candle',
          open: '100',
          close: '100',
          high: '110',
          low: '90',
          volume: '1',
        },
      ],
    },
    {
      __typename: 'Market',
      id: 'market-1',
      candles: [
        {
          __typename: 'Candle',
          open: '100',
          close: '100',
          high: '110',
          low: '90',
          volume: '1',
        },
      ],
    },
    {
      __typename: 'Market',
      id: 'market-2',
      candles: [
        {
          __typename: 'Candle',
          open: '100',
          close: '100',
          high: '110',
          low: '90',
          volume: '1',
        },
      ],
    },
    {
      __typename: 'Market',
      id: 'market-3',
      candles: [
        {
          __typename: 'Candle',
          open: '100',
          close: '100',
          high: '110',
          low: '90',
          volume: '1',
        },
      ],
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
