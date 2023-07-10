import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type BlockStatisticsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type BlockStatisticsQuery = { __typename: 'Query', statistics: { __typename: 'Statistics', blockHeight: string, blockDuration: string } };


export const BlockStatisticsDocument = gql`
    query BlockStatistics {
  statistics {
    blockHeight
    blockDuration
  }
}
    `;

/**
 * __useBlockStatisticsQuery__
 *
 * To run a query within a React component, call `useBlockStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBlockStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBlockStatisticsQuery({
 *   variables: {
 *   },
 * });
 */
export function useBlockStatisticsQuery(baseOptions?: Apollo.QueryHookOptions<BlockStatisticsQuery, BlockStatisticsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BlockStatisticsQuery, BlockStatisticsQueryVariables>(BlockStatisticsDocument, options);
      }
export function useBlockStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BlockStatisticsQuery, BlockStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BlockStatisticsQuery, BlockStatisticsQueryVariables>(BlockStatisticsDocument, options);
        }
export type BlockStatisticsQueryHookResult = ReturnType<typeof useBlockStatisticsQuery>;
export type BlockStatisticsLazyQueryHookResult = ReturnType<typeof useBlockStatisticsLazyQuery>;
export type BlockStatisticsQueryResult = Apollo.QueryResult<BlockStatisticsQuery, BlockStatisticsQueryVariables>;