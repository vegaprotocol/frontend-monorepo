import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TotalValueLockedQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type TotalValueLockedQuery = { __typename?: 'Query', partiesConnection?: { __typename?: 'PartyConnection', edges: Array<{ __typename?: 'PartyEdge', node: { __typename?: 'Party', accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', symbol: string, quantum: string } } } | null> | null } | null } }> } | null };


export const TotalValueLockedDocument = gql`
    query TotalValueLocked {
  partiesConnection(pagination: {first: 5000}) {
    edges {
      node {
        accountsConnection(pagination: {first: 5000}) {
          edges {
            node {
              type
              balance
              asset {
                symbol
                quantum
              }
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useTotalValueLockedQuery__
 *
 * To run a query within a React component, call `useTotalValueLockedQuery` and pass it any options that fit your needs.
 * When your component renders, `useTotalValueLockedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTotalValueLockedQuery({
 *   variables: {
 *   },
 * });
 */
export function useTotalValueLockedQuery(baseOptions?: Apollo.QueryHookOptions<TotalValueLockedQuery, TotalValueLockedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TotalValueLockedQuery, TotalValueLockedQueryVariables>(TotalValueLockedDocument, options);
      }
export function useTotalValueLockedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TotalValueLockedQuery, TotalValueLockedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TotalValueLockedQuery, TotalValueLockedQueryVariables>(TotalValueLockedDocument, options);
        }
export type TotalValueLockedQueryHookResult = ReturnType<typeof useTotalValueLockedQuery>;
export type TotalValueLockedLazyQueryHookResult = ReturnType<typeof useTotalValueLockedLazyQuery>;
export type TotalValueLockedQueryResult = Apollo.QueryResult<TotalValueLockedQuery, TotalValueLockedQueryVariables>;