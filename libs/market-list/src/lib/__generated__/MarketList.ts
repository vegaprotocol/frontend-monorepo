import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketListItemFragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', symbol: string } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null } };

export type MarketListQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketListQuery = { __typename?: 'Query', marketsConnection: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', symbol: string } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null } } }> } };

export const MarketListItemFragmentDoc = gql`
    fragment MarketListItem on Market {
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
          settlementAsset {
            symbol
          }
        }
      }
    }
  }
  marketTimestamps {
    open
    close
  }
}
    `;
export const MarketListDocument = gql`
    query MarketList {
  marketsConnection {
    edges {
      node {
        ...MarketListItem
      }
    }
  }
}
    ${MarketListItemFragmentDoc}`;

/**
 * __useMarketListQuery__
 *
 * To run a query within a React component, call `useMarketListQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketListQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketListQuery(baseOptions?: Apollo.QueryHookOptions<MarketListQuery, MarketListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketListQuery, MarketListQueryVariables>(MarketListDocument, options);
      }
export function useMarketListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketListQuery, MarketListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketListQuery, MarketListQueryVariables>(MarketListDocument, options);
        }
export type MarketListQueryHookResult = ReturnType<typeof useMarketListQuery>;
export type MarketListLazyQueryHookResult = ReturnType<typeof useMarketListLazyQuery>;
export type MarketListQueryResult = Apollo.QueryResult<MarketListQuery, MarketListQueryVariables>;