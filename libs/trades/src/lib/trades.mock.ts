import { Side } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  TradesQuery,
  TradeFieldsFragment,
  TradesUpdateSubscription,
} from './__generated__/Trades';

export const tradesQuery = (
  override?: PartialDeep<TradesQuery>
): TradesQuery => {
  const defaultResult: TradesQuery = {
    trades: {
      __typename: 'TradeConnection',
      edges: trades.map((node, i) => ({
        __typename: 'TradeEdge',
        node,
        cursor: (i + 1).toString(),
      })),
      pageInfo: {
        __typename: 'PageInfo',
        startCursor: '0',
        endCursor: trades.length.toString(),
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  };

  return merge(defaultResult, override);
};

export const tradesUpdateSubscription = (
  override: PartialDeep<TradesUpdateSubscription>
): TradesUpdateSubscription => {
  const defaultResult: TradesUpdateSubscription = {
    __typename: 'Subscription',
    tradesStream: [
      {
        __typename: 'TradeUpdate',
        id: '1234567890',
        price: '17116898',
        size: '24',
        createdAt: '2022-04-06T16:19:42.692598951Z',
        marketId: 'market-0',
        aggressor: Side.SIDE_BUY,
      },
    ],
  };
  return merge(defaultResult, override);
};

const trades: TradeFieldsFragment[] = [
  {
    id: 'FFFFBC80005C517A10ACF481F7E6893769471098E696D0CC407F18134044CB16',
    price: '17116898',
    size: '24',
    createdAt: '2022-04-06T16:19:42.692598951Z',
    aggressor: Side.SIDE_BUY,
    market: {
      id: 'market-0',
      __typename: 'Market',
    },
    __typename: 'Trade',
  },
  {
    id: 'FFFFB91453AC8F26EDAC223E2FB6C4A61461B1837946B51D943D675FB94FDF72',
    price: '17209102',
    size: '7',
    createdAt: '2022-04-07T06:59:44.835686754Z',
    aggressor: Side.SIDE_SELL,
    market: {
      id: 'market-0',
      __typename: 'Market',
    },
    __typename: 'Trade',
  },
  {
    id: 'FFFFAD1BF47AA2853E5C375B6B3A62375F62D5B10807583D32EF3119CC455CD1',
    price: '17106734',
    size: '18',
    createdAt: '2022-04-07T17:56:47.997938583Z',
    aggressor: Side.SIDE_BUY,
    market: {
      id: 'market-0',
      __typename: 'Market',
    },
    __typename: 'Trade',
  },
];
