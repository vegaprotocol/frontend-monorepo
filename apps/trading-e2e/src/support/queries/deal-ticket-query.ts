import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

// TODO: Figure out how to get types
// eslint-disable-next-line
type DealTicketQuery = any;

export const generateDealTicketQuery = (
  override?: PartialDeep<DealTicketQuery>
): DealTicketQuery => {
  const defaultResult: DealTicketQuery = {
    market: {
      id: 'market-id',
      decimalPlaces: 2,
      state: MarketState.Active,
      tradingMode: MarketTradingMode.Continuous,
      tradableInstrument: {
        instrument: {
          product: {
            quoteName: 'BTC',
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '100',
        },
      },
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
