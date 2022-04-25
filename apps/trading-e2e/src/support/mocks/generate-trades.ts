import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { Trades, Trades_market_trades } from '@vegaprotocol/trades';

export const generateTrades = (override?: PartialDeep<Trades>): Trades => {
  const trades: Trades_market_trades[] = [
    {
      id: 'FFFFBC80005C517A10ACF481F7E6893769471098E696D0CC407F18134044CB16',
      price: '17116898',
      size: '24',
      createdAt: '2022-04-06T16:19:42.692598951Z',
      market: {
        id: '0c3c1490db767f926d24fb674b4235a9aa339614915a4ab96cbfc0e1ad83c0ff',
        decimalPlaces: 5,
        __typename: 'Market',
      },
      __typename: 'Trade',
    },
    {
      id: 'FFFFB91453AC8F26EDAC223E2FB6C4A61461B1837946B51D943D675FB94FDF72',
      price: '17209102',
      size: '7',
      createdAt: '2022-04-07T06:59:44.835686754Z',
      market: {
        id: '0c3c1490db767f926d24fb674b4235a9aa339614915a4ab96cbfc0e1ad83c0ff',
        decimalPlaces: 5,
        __typename: 'Market',
      },
      __typename: 'Trade',
    },
    {
      id: 'FFFFAD1BF47AA2853E5C375B6B3A62375F62D5B10807583D32EF3119CC455CD1',
      price: '17106734',
      size: '18',
      createdAt: '2022-04-07T17:56:47.997938583Z',
      market: {
        id: '0c3c1490db767f926d24fb674b4235a9aa339614915a4ab96cbfc0e1ad83c0ff',
        decimalPlaces: 5,
        __typename: 'Market',
      },
      __typename: 'Trade',
    },
  ];
  const defaultResult = {
    market: {
      id: 'market-id',
      trades,
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
