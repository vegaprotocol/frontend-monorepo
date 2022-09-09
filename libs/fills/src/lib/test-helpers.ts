import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { FillsQuery, FillFieldsFragment } from './__generated__/Fills';
import { Side } from '@vegaprotocol/types';

export const generateFills = (
  override?: PartialDeep<FillsQuery>
): FillsQuery => {
  const fills: FillFieldsFragment[] = [
    generateFill({
      buyer: {
        id: 'party-id',
      },
    }),
    generateFill({
      id: '1',
      seller: {
        id: 'party-id',
      },
      aggressor: Side.SIDE_SELL,
      buyerFee: {
        infrastructureFee: '5000',
      },
      market: {
        tradableInstrument: {
          instrument: {
            name: 'UNIDAI Monthly (30 Jun 2022)',
          },
        },
        positionDecimalPlaces: 2,
      },
    }),
    generateFill({
      id: '2',
      seller: {
        id: 'party-id',
      },
      aggressor: Side.SIDE_BUY,
    }),
    generateFill({
      id: '3',
      aggressor: Side.SIDE_SELL,
      market: {
        tradableInstrument: {
          instrument: {
            name: 'UNIDAI Monthly (30 Jun 2022)',
          },
        },
      },
      buyer: {
        id: 'party-id',
      },
    }),
  ];

  const defaultResult: FillsQuery = {
    party: {
      id: 'buyer-id',
      tradesConnection: {
        __typename: 'TradeConnection',
        edges: fills.map((f) => {
          return {
            __typename: 'TradeEdge',
            node: f,
            cursor: '3',
          };
        }),
        pageInfo: {
          __typename: 'PageInfo',
          startCursor: '1',
          endCursor: '2',
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};

export const generateFill = (override?: PartialDeep<FillFieldsFragment>) => {
  const defaultFill: FillFieldsFragment = {
    __typename: 'Trade',
    id: '0',
    createdAt: '2005-04-02T19:37:00.000Z',
    price: '10000000',
    size: '50000',
    buyOrder: 'buy-order',
    sellOrder: 'sell-order',
    aggressor: Side.SIDE_BUY,
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
      name: 'UNIDAI Monthly (30 Jun 2022)',
      positionDecimalPlaces: 0,
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: 'instrument-id',
          code: 'instrument-code',
          name: 'UNIDAI Monthly (30 Jun 2022)',
          product: {
            __typename: 'Future',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-id',
              symbol: 'SYM',
              decimals: 18,
            },
          },
        },
      },
    },
  };

  return merge(defaultFill, override);
};
