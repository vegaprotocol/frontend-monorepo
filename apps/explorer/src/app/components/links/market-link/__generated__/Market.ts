import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerMarketQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerMarketQuery = { __typename: 'Query', market?: { __typename: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradableInstrument: { __typename: 'TradableInstrument', instrument: { __typename: 'Instrument', name: string, product: { __typename: 'Future', quoteName: string, settlementAsset: { __typename: 'Asset', decimals: number } } } } } | null };


export const ExplorerMarketDocument = gql`
    query ExplorerMarket($id: ID!) {
  market(id: $id) {
    id
    decimalPlaces
    positionDecimalPlaces
    tradableInstrument {
      instrument {
        name
        product {
          ... on Future {
            quoteName
            settlementAsset {
              decimals
            }
          }
        }
      }
    }
    state
  }
}
    `;

/**
 * __useExplorerMarketQuery__
 *
 * To run a query within a React component, call `useExplorerMarketQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerMarketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerMarketQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerMarketQuery(baseOptions: Apollo.QueryHookOptions<ExplorerMarketQuery, ExplorerMarketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerMarketQuery, ExplorerMarketQueryVariables>(ExplorerMarketDocument, options);
      }
export function useExplorerMarketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerMarketQuery, ExplorerMarketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerMarketQuery, ExplorerMarketQueryVariables>(ExplorerMarketDocument, options);
        }
export type ExplorerMarketQueryHookResult = ReturnType<typeof useExplorerMarketQuery>;
export type ExplorerMarketLazyQueryHookResult = ReturnType<typeof useExplorerMarketLazyQuery>;
export type ExplorerMarketQueryResult = Apollo.QueryResult<ExplorerMarketQuery, ExplorerMarketQueryVariables>;