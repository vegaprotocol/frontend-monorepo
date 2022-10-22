import type { DealTicketQuery } from '@vegaprotocol/deal-ticket';
import { MarketTradingMode, MarketState } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateDealTicket = (
  override?: PartialDeep<DealTicketQuery>
): DealTicketQuery => {
  const defaultResult: DealTicketQuery = {
    market: {
      id: 'ca7768f6de84bf86a21bbb6b0109d9659c81917b0e0339b2c262566c9b581a15',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      state: MarketState.STATE_ACTIVE,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      tradableInstrument: {
        instrument: {
          id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
          name: 'AAVEDAI Monthly (30 Jun 2022)',
          product: {
            quoteName: 'DAI',
            settlementAsset: {
              id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
              symbol: 'tDAI',
              name: 'tDAI TEST',
              decimals: 0,
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      depth: {
        lastTrade: { price: '9893006', __typename: 'Trade' },
        __typename: 'MarketDepth',
      },
      fees: {
        factors: {
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.001',
          __typename: 'FeeFactors',
        },
        __typename: 'Fees',
      },
      __typename: 'Market',
    },
  };
  return merge(defaultResult, override);
};
