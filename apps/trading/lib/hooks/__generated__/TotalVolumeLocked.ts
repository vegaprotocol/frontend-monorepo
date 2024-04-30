import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TotalVolumeLockedQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type TotalVolumeLockedQuery = { __typename?: 'Query', partiesConnection?: { __typename?: 'PartyConnection', edges: Array<{ __typename?: 'PartyEdge', node: { __typename?: 'Party', accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', symbol: string, quantum: string } } } | null> | null } | null } }> } | null };


export const TotalVolumeLockedDocument = gql`
    query TotalVolumeLocked {
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
 * __useTotalVolumeLockedQuery__
 *
 * To run a query within a React component, call `useTotalVolumeLockedQuery` and pass it any options that fit your needs.
 * When your component renders, `useTotalVolumeLockedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTotalVolumeLockedQuery({
 *   variables: {
 *   },
 * });
 */
export function useTotalVolumeLockedQuery(baseOptions?: Apollo.QueryHookOptions<TotalVolumeLockedQuery, TotalVolumeLockedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TotalVolumeLockedQuery, TotalVolumeLockedQueryVariables>(TotalVolumeLockedDocument, options);
      }
export function useTotalVolumeLockedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TotalVolumeLockedQuery, TotalVolumeLockedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TotalVolumeLockedQuery, TotalVolumeLockedQueryVariables>(TotalVolumeLockedDocument, options);
        }
export type TotalVolumeLockedQueryHookResult = ReturnType<typeof useTotalVolumeLockedQuery>;
export type TotalVolumeLockedLazyQueryHookResult = ReturnType<typeof useTotalVolumeLockedLazyQuery>;
export type TotalVolumeLockedQueryResult = Apollo.QueryResult<TotalVolumeLockedQuery, TotalVolumeLockedQueryVariables>;