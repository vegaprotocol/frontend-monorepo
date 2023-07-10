import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerStatsFieldsFragment = { __typename: 'Statistics', averageOrdersPerBlock: string, ordersPerSecond: string, txPerBlock: string, tradesPerSecond: string };

export type ExplorerStatsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerStatsQuery = { __typename: 'Query', statistics: { __typename: 'Statistics', averageOrdersPerBlock: string, ordersPerSecond: string, txPerBlock: string, tradesPerSecond: string } };

export const ExplorerStatsFieldsFragmentDoc = gql`
    fragment ExplorerStatsFields on Statistics {
  averageOrdersPerBlock
  ordersPerSecond
  txPerBlock
  tradesPerSecond
}
    `;
export const ExplorerStatsDocument = gql`
    query ExplorerStats {
  statistics {
    ...ExplorerStatsFields
  }
}
    ${ExplorerStatsFieldsFragmentDoc}`;

/**
 * __useExplorerStatsQuery__
 *
 * To run a query within a React component, call `useExplorerStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerStatsQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerStatsQuery, ExplorerStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerStatsQuery, ExplorerStatsQueryVariables>(ExplorerStatsDocument, options);
      }
export function useExplorerStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerStatsQuery, ExplorerStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerStatsQuery, ExplorerStatsQueryVariables>(ExplorerStatsDocument, options);
        }
export type ExplorerStatsQueryHookResult = ReturnType<typeof useExplorerStatsQuery>;
export type ExplorerStatsLazyQueryHookResult = ReturnType<typeof useExplorerStatsLazyQuery>;
export type ExplorerStatsQueryResult = Apollo.QueryResult<ExplorerStatsQuery, ExplorerStatsQueryVariables>;