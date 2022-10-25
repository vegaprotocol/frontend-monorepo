import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import { MarketState, MarketTradingMode, Schema } from '@vegaprotocol/types';
import type { Trade } from './fills-data-provider';

export const generateFill = (override?: PartialDeep<Trade>) => {
  const defaultFill: Trade = {
    __typename: 'Trade',
    id: '0',
    createdAt: '2005-04-02T19:37:00.000Z',
    price: '10000000',
    size: '50000',
    buyOrder: 'buy-order',
    sellOrder: 'sell-order',
    aggressor: Schema.Side.SIDE_BUY,
    buyer: {
      __typename: 'Party',
      id: 'buyer-id',
    },
    seller: {
      __typename: 'Party',
      id: 'seller-id',
    },
    buyerFee: {
      __typename: 'TradeFee',
      makerFee: '100',
      infrastructureFee: '100',
      liquidityFee: '100',
    },
    sellerFee: {
      __typename: 'TradeFee',
      makerFee: '200',
      infrastructureFee: '200',
      liquidityFee: '200',
    },
    market: {
      __typename: 'Market',
      id: 'market-id',
      positionDecimalPlaces: 0,
      decimalPlaces: 5,
      state: MarketState.STATE_ACTIVE,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          infrastructureFee: '0.1',
          liquidityFee: '0.1',
          makerFee: '0.1',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '2005-04-02T19:37:00.000Z',
        close: '2005-04-02T19:37:00.000Z',
      },
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: 'instrument-id',
          code: 'instrument-code',
          name: 'UNIDAI Monthly (30 Jun 2022)',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: ['tag-a'],
          },
          product: {
            __typename: 'Future',
            settlementAsset: {
              __typename: 'Asset',
              symbol: 'SYM',
              decimals: 18,
            },
            quoteName: '',
          },
        },
      },
    },
  };

  return merge(defaultFill, override);
};
