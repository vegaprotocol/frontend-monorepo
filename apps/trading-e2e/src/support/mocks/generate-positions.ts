import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  Positions,
  Positions_party_positions,
} from '@vegaprotocol/positions';
import { MarketTradingMode } from '@vegaprotocol/types';

export const generatePositions = (
  override?: PartialDeep<Positions>
): Positions => {
  const positions: Positions_party_positions[] = [
    {
      realisedPNL: '0',
      openVolume: '6',
      unrealisedPNL: '895000',
      averageEntryPrice: '1129935',
      market: {
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
        name: 'UNIDAI Monthly (30 Jun 2022)',
        data: {
          markPrice: '17588787',
          marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'MarketData',
          market: { __typename: 'Market', id: '123' },
        },
        decimalPlaces: 5,
        positionDecimalPlaces: 0,
        tradableInstrument: {
          instrument: {
            name: 'UNIDAI Monthly (30 Jun 2022)',
            code: 'UNIDAI.MF21',
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      __typename: 'Position',
    },
    {
      realisedPNL: '0',
      openVolume: '1',
      unrealisedPNL: '-22519',
      averageEntryPrice: '84400088',
      market: {
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
        name: 'Tesla Quarterly (30 Jun 2022)',
        data: {
          markPrice: '84377569',
          marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          __typename: 'MarketData',
          market: {
            __typename: 'Market',
            id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
          },
        },
        decimalPlaces: 5,
        positionDecimalPlaces: 0,
        tradableInstrument: {
          instrument: {
            name: 'Tesla Quarterly (30 Jun 2022)',
            code: 'TSLA.QM21',
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      __typename: 'Position',
    },
  ];

  const defaultResult = {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      positions,
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};
