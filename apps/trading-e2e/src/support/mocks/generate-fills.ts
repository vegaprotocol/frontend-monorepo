import type {
  Fills,
  Fills_party_tradesConnection_edges_node,
} from '@vegaprotocol/fills';
import { Side } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateFills = (override?: PartialDeep<Fills>): Fills => {
  const fills: Fills_party_tradesConnection_edges_node[] = [
    generateFill({
      buyer: {
        id: Cypress.env('VEGA_PUBLIC_KEY'),
      },
    }),
    generateFill({
      id: '1',
      seller: {
        id: Cypress.env('VEGA_PUBLIC_KEY'),
      },
      aggressor: Side.SIDE_SELL,
      buyerFee: {
        infrastructureFee: '5000',
      },
      market: {
        id: 'market-1',
      },
    }),
    generateFill({
      id: '2',
      seller: {
        id: Cypress.env('VEGA_PUBLIC_KEY'),
      },
      aggressor: Side.SIDE_BUY,
    }),
    generateFill({
      id: '3',
      aggressor: Side.SIDE_SELL,
      market: {
        id: 'market-2',
      },
      buyer: {
        id: Cypress.env('VEGA_PUBLIC_KEY'),
      },
    }),
  ];

  const defaultResult: Fills = {
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

export const generateFill = (
  override?: PartialDeep<Fills_party_tradesConnection_edges_node>
) => {
  const defaultFill: Fills_party_tradesConnection_edges_node = {
    __typename: 'Trade',
    id: '0',
    createdAt: new Date().toISOString(),
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
      id: 'market-0',
    },
  };

  return merge(defaultFill, override);
};
