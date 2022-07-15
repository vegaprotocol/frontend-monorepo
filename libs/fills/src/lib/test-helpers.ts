import merge from 'lodash/merge';
import type { IGetRowsParams } from 'ag-grid-community';
import type { PartialDeep } from 'type-fest';
import type {
  Fills,
  Fills_party_tradesConnection_edges_node,
} from './__generated__/Fills';
import { Side } from '@vegaprotocol/types';

export const generateFills = (override?: PartialDeep<Fills>): Fills => {
  const fills: Fills_party_tradesConnection_edges_node[] = [
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
      aggressor: Side.Sell,
      buyerFee: {
        infrastructureFee: '5000',
      },
      market: {
        name: 'Apples Daily v3',
        positionDecimalPlaces: 2,
      },
    }),
    generateFill({
      id: '2',
      seller: {
        id: 'party-id',
      },
      aggressor: Side.Buy,
    }),
    generateFill({
      id: '3',
      aggressor: Side.Sell,
      market: {
        name: 'ETHBTC Quarterly (30 Jun 2022)',
      },
      buyer: {
        id: 'party-id',
      },
    }),
  ];

  const defaultResult: Fills = {
    party: {
      id: 'buyer-id',
      tradesConnection: {
        __typename: 'TradeConnection',
        totalCount: 1,
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
    aggressor: Side.Buy,
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

export const makeGetRows =
  (data: Fills_party_tradesConnection_edges_node[]) =>
  ({ successCallback }: IGetRowsParams) => {
    successCallback(data, data.length);
  };
