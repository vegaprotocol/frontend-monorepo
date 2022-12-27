import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  MarketQuery,
  SingleMarketFieldsFragment,
} from './__generated__/market';

export const marketQuery = (
  override?: PartialDeep<MarketQuery>
): MarketQuery => {
  const defaultResult: MarketQuery = {
    __typename: 'Query',
    market: Object.assign({}, singleMarketFieldsFragment),
  };
  return merge(Object.assign({}, defaultResult), override);
};

const singleMarketFieldsFragment: SingleMarketFieldsFragment = {
  __typename: 'Market',
  id: 'market-0',
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  state: Schema.MarketState.STATE_ACTIVE,
  decimalPlaces: 5,
  positionDecimalPlaces: 0,
  tradableInstrument: {
    instrument: {
      id: 'BTCUSD.MF21',
      name: 'ACTIVE MARKET',
      code: 'BTCUSD.MF21',
      metadata: {
        tags: [
          'formerly:076BB86A5AA41E3E',
          'base:BTC',
          'quote:USD',
          'class:fx/crypto',
          'monthly',
          'sector:crypto',
        ],
        __typename: 'InstrumentMetadata',
      },
      product: {
        dataSourceSpecForTradingTermination: {
          id: 'd253c16c6a17ab88e098479635c611ab503582a1079752d1a49ac15f656f7e7b',
          __typename: 'DataSourceSpec',
        },
        quoteName: 'BTC',
        settlementAsset: {
          decimals: 5,
          id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
          symbol: 'tBTC',
          name: 'tBTC TEST',
          __typename: 'Asset',
        },
        __typename: 'Future',
      },
      __typename: 'Instrument',
    },
    __typename: 'TradableInstrument',
  },
  marketTimestamps: {
    open: '2022-06-21T17:18:43.484055236Z',
    close: null,
    __typename: 'MarketTimestamps',
  },
  fees: {
    __typename: 'Fees',
    factors: {
      __typename: 'FeeFactors',
      makerFee: '0.0002',
      infrastructureFee: '0.0005',
      liquidityFee: '0.0005',
    },
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: { price: '100', __typename: 'Trade' },
  },
};
