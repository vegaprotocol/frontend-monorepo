import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketFieldsFragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, oracleSpecForTradingTermination: { __typename?: 'OracleSpec', id: string }, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null }, depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } };

export type MarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, oracleSpecForTradingTermination: { __typename?: 'OracleSpec', id: string }, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null }, depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } } }> } | null };

export const MarketFieldsFragmentDoc = gql`
    fragment MarketFields on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  state
  tradingMode
  fees {
    factors {
      makerFee
      infrastructureFee
      liquidityFee
    }
  }
  tradableInstrument {
    instrument {
      id
      name
      code
      metadata {
        tags
      }
      product {
        ... on Future {
          oracleSpecForTradingTermination {
            id
          }
          settlementAsset {
            id
            symbol
            name
            decimals
          }
          quoteName
        }
      }
    }
  }
  marketTimestamps {
    open
    close
  }
  depth {
    lastTrade {
      price
    }
  }
}
    `;
export const MarketsDocument = gql`
    query Markets {
  marketsConnection {
    edges {
      node {
        ...MarketFields
      }
    }
  }
}
    ${MarketFieldsFragmentDoc}`;

/**
 * __useMarketsQuery__
 *
 * To run a query within a React component, call `useMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketsQuery(baseOptions?: Apollo.QueryHookOptions<MarketsQuery, MarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsQuery, MarketsQueryVariables>(MarketsDocument, options);
      }
export function useMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsQuery, MarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsQuery, MarketsQueryVariables>(MarketsDocument, options);
        }
export type MarketsQueryHookResult = ReturnType<typeof useMarketsQuery>;
export type MarketsLazyQueryHookResult = ReturnType<typeof useMarketsLazyQuery>;
export type MarketsQueryResult = Apollo.QueryResult<MarketsQuery, MarketsQueryVariables>;