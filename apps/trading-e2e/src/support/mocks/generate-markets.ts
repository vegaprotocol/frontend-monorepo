import merge from 'lodash/merge';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  MarketsQuery,
  Market,
  MarketsCandlesQuery,
  MarketsDataQuery,
  MarketData,
} from '@vegaprotocol/market-list';

export const generateMarkets = (
  override?: PartialDeep<MarketsQuery>
): MarketsQuery => {
  const markets: Market[] = [
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
              id: '',
              name: '',
            },
            quoteName: 'DAI',
            __typename: 'Future',
            oracleSpecForTradingTermination: {
              id: '',
              __typename: 'OracleSpec',
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '1001',
        },
      },
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
              id: '',
              name: '',
            },
            quoteName: 'USD',
            __typename: 'Future',
            oracleSpecForTradingTermination: {
              id: '',
              __typename: 'OracleSpec',
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '1001',
        },
      },
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
              id: '',
              name: '',
            },
            quoteName: 'USDC',
            __typename: 'Future',
            oracleSpecForTradingTermination: {
              id: '',
              __typename: 'OracleSpec',
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '1001',
        },
      },
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
              id: '',
              name: '',
            },
            quoteName: 'BTC',
            __typename: 'Future',
            oracleSpecForTradingTermination: {
              id: '',
              __typename: 'OracleSpec',
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '1001',
        },
      },
    },
  ];

  const defaultResult: MarketsQuery = {
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
  const markets: MarketData[] = [
    {
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
    {
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
    {
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
    {
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
  ];

  const defaultResult: MarketsDataQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((data) => ({
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          data,
        },
      })),
    },
  };

  return merge(defaultResult, override);
};

export const generateMarketsCandles = (
  override?: PartialDeep<MarketsDataQuery>
): MarketsCandlesQuery => {
  const defaultResult: MarketsCandlesQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: [
        {
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            id: 'market-0',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                {
                  __typename: 'CandleEdge',
                  node: {
                    __typename: 'Candle',
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
        },
        {
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            id: 'market-1',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                {
                  __typename: 'CandleEdge',
                  node: {
                    __typename: 'Candle',
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
        },
        {
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            id: 'market-2',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                {
                  __typename: 'CandleEdge',
                  node: {
                    __typename: 'Candle',
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
        },
        {
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            id: 'market-3',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                {
                  __typename: 'CandleEdge',
                  node: {
                    __typename: 'Candle',
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
        },
      ],
    },
  };

  return merge(defaultResult, override);
};
