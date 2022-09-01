import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketNamesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketNamesQuery = { __typename?: 'Query', markets?: Array<{ __typename?: 'Market', id: string, name: string, state: Types.MarketState, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string } } } }> | null };


export const MarketNamesDocument = gql`
    query MarketNames {
  markets {
    id
    name
    state
    tradableInstrument {
      instrument {
        code
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
 * __useMarketNamesQuery__
 *
 * To run a query within a React component, call `useMarketNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketNamesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketNamesQuery(baseOptions?: Apollo.QueryHookOptions<MarketNamesQuery, MarketNamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketNamesQuery, MarketNamesQueryVariables>(MarketNamesDocument, options);
      }
export function useMarketNamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketNamesQuery, MarketNamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketNamesQuery, MarketNamesQueryVariables>(MarketNamesDocument, options);
        }
export type MarketNamesQueryHookResult = ReturnType<typeof useMarketNamesQuery>;
export type MarketNamesLazyQueryHookResult = ReturnType<typeof useMarketNamesLazyQuery>;
export type MarketNamesQueryResult = Apollo.QueryResult<MarketNamesQuery, MarketNamesQueryVariables>;