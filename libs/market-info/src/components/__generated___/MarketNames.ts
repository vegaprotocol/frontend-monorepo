import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketInfoMarketNamesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketInfoMarketNamesQuery = { __typename?: 'Query', markets?: Array<{ __typename?: 'Market', id: string, state: Types.MarketState, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string, name: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string } } } }> | null };


export const MarketInfoMarketNamesDocument = gql`
    query MarketInfoMarketNames {
  markets {
    id
    state
    tradableInstrument {
      instrument {
        code
        name
        metadata {
          tags
        }
        product {
          ... on Future {
            quoteName
          }
        }
      }
    }
  }
}
    `;

/**
 * __useMarketInfoMarketNamesQuery__
 *
 * To run a query within a React component, call `useMarketInfoMarketNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketInfoMarketNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketInfoMarketNamesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketInfoMarketNamesQuery(baseOptions?: Apollo.QueryHookOptions<MarketInfoMarketNamesQuery, MarketInfoMarketNamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketInfoMarketNamesQuery, MarketInfoMarketNamesQueryVariables>(MarketInfoMarketNamesDocument, options);
      }
export function useMarketInfoMarketNamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketInfoMarketNamesQuery, MarketInfoMarketNamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketInfoMarketNamesQuery, MarketInfoMarketNamesQueryVariables>(MarketInfoMarketNamesDocument, options);
        }
export type MarketInfoMarketNamesQueryHookResult = ReturnType<typeof useMarketInfoMarketNamesQuery>;
export type MarketInfoMarketNamesLazyQueryHookResult = ReturnType<typeof useMarketInfoMarketNamesLazyQuery>;
export type MarketInfoMarketNamesQueryResult = Apollo.QueryResult<MarketInfoMarketNamesQuery, MarketInfoMarketNamesQueryVariables>;