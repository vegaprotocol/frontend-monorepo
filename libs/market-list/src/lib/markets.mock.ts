import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  MarketFieldsFragment,
  MarketsQuery,
} from './__generated__/markets';

export const marketsQuery = (
  override?: PartialDeep<MarketsQuery>
): MarketsQuery => {
  const defaultResult: MarketsQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: marketFieldsFragments.map((node) => ({
        __typename: 'MarketEdge',
        node,
      })),
    },
  };

  return merge(defaultResult, override);
};

const marketFieldsFragments: MarketFieldsFragment[] = [
  {
    id: 'market-0',
    decimalPlaces: 5,
    positionDecimalPlaces: 0,
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    state: Schema.MarketState.STATE_ACTIVE,
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      close: null,
      open: null,
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
            id: 'asset-0',
            symbol: 'tDAI',
            name: 'tDAI',
            decimals: 5,
            __typename: 'Asset',
          },
          dataSourceSpecForTradingTermination: {
            id: '',
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
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
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
            id: 'asset-1',
            symbol: 'XYZalpha',
            name: 'XYZalpha',
            decimals: 5,
            __typename: 'Asset',
          },
          dataSourceSpecForTradingTermination: {
            id: '',
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
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
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
            id: 'asset-2',
            name: '',
            symbol: 'tUSDC',
            decimals: 5,
            __typename: 'Asset',
          },
          dataSourceSpecForTradingTermination: {
            id: '',
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
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
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
            id: 'asset-3',
            symbol: 'tBTC',
            name: '',
            decimals: 5,
            __typename: 'Asset',
          },
          dataSourceSpecForTradingTermination: {
            id: '',
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
