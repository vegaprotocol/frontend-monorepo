import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type StatsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type StatsQuery = { __typename: 'Query', epoch: { __typename: 'Epoch', id: string }, nodeData?: { __typename: 'NodeData', stakedTotal: string, totalNodes: number, inactiveNodes: number } | null, statistics: { __typename: 'Statistics', status: string, blockHeight: string, blockDuration: string, backlogLength: string, txPerBlock: string, tradesPerSecond: string, ordersPerSecond: string, averageOrdersPerBlock: string, vegaTime: any, appVersion: string, chainVersion: string, chainId: string, genesisTime: any } };


export const StatsDocument = gql`
    query Stats {
  epoch {
    id
  }
  nodeData {
    stakedTotal
    totalNodes
    inactiveNodes
  }
  statistics {
    status
    blockHeight
    blockDuration
    backlogLength
    txPerBlock
    tradesPerSecond
    ordersPerSecond
    averageOrdersPerBlock
    vegaTime
    appVersion
    chainVersion
    chainId
    genesisTime
  }
}
    `;

/**
 * __useStatsQuery__
 *
 * To run a query within a React component, call `useStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useStatsQuery(baseOptions?: Apollo.QueryHookOptions<StatsQuery, StatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StatsQuery, StatsQueryVariables>(StatsDocument, options);
      }
export function useStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StatsQuery, StatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StatsQuery, StatsQueryVariables>(StatsDocument, options);
        }
export type StatsQueryHookResult = ReturnType<typeof useStatsQuery>;
export type StatsLazyQueryHookResult = ReturnType<typeof useStatsLazyQuery>;
export type StatsQueryResult = Apollo.QueryResult<StatsQuery, StatsQueryVariables>;