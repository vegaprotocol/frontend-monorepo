import type { DealTicketQuery } from '@vegaprotocol/deal-ticket';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateDealTicketQuery = (
  override?: PartialDeep<DealTicketQuery>
): DealTicketQuery => {
  const defaultResult: DealTicketQuery = {
    market: {
      __typename: 'Market',
      id: 'market-0',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      state: MarketState.STATE_ACTIVE,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      fees: {
        factors: {
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.0005',
        },
      },
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: 'tBTC TEST',
          name: 'ETHBTC Quarterly (30 Jun 2022)',
          product: {
            __typename: 'Future',
            quoteName: 'BTC',
            settlementAsset: {
              __typename: 'Asset',
              id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
              symbol: 'tBTC',
              name: 'tBTC TEST',
              decimals: 5,
            },
          },
        },
      },
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '100',
        },
      },
    },
  };

  return merge(defaultResult, override);
};
