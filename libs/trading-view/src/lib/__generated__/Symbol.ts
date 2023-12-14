import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SymbolQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type SymbolQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string, name: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename: 'Future' } | { __typename: 'Perpetual' } | { __typename?: 'Spot' } } } } | null };


export const SymbolDocument = gql`
    query Symbol($marketId: ID!) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    tradableInstrument {
      instrument {
        code
        name
        metadata {
          tags
        }
        product {
          ... on Future {
            __typename
          }
          ... on Perpetual {
            __typename
          }
        }
      }
    }
  }
}
    `;

/**
 * __useSymbolQuery__
 *
 * To run a query within a React component, call `useSymbolQuery` and pass it any options that fit your needs.
 * When your component renders, `useSymbolQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSymbolQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useSymbolQuery(baseOptions: Apollo.QueryHookOptions<SymbolQuery, SymbolQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SymbolQuery, SymbolQueryVariables>(SymbolDocument, options);
      }
export function useSymbolLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SymbolQuery, SymbolQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SymbolQuery, SymbolQueryVariables>(SymbolDocument, options);
        }
export type SymbolQueryHookResult = ReturnType<typeof useSymbolQuery>;
export type SymbolLazyQueryHookResult = ReturnType<typeof useSymbolLazyQuery>;
export type SymbolQueryResult = Apollo.QueryResult<SymbolQuery, SymbolQueryVariables>;