import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NetworkStatsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NetworkStatsQuery = { __typename?: 'Query', nodeData?: { __typename?: 'NodeData', stakedTotal: string, totalNodes: number, inactiveNodes: number, validatingNodes: number } | null, statistics: { __typename?: 'Statistics', status: string, blockHeight: string, blockDuration: string, backlogLength: string, txPerBlock: string, tradesPerSecond: string, ordersPerSecond: string, averageOrdersPerBlock: string, vegaTime: string, appVersion: string, chainVersion: string, chainId: string, upTime: string } };


export const NetworkStatsDocument = gql`
    query NetworkStats {
  nodeData {
    stakedTotal
    totalNodes
    inactiveNodes
    validatingNodes
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
    upTime
  }
}
    `;

/**
 * __useNetworkStatsQuery__
 *
 * To run a query within a React component, call `useNetworkStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNetworkStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNetworkStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useNetworkStatsQuery(baseOptions?: Apollo.QueryHookOptions<NetworkStatsQuery, NetworkStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NetworkStatsQuery, NetworkStatsQueryVariables>(NetworkStatsDocument, options);
      }
export function useNetworkStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NetworkStatsQuery, NetworkStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NetworkStatsQuery, NetworkStatsQueryVariables>(NetworkStatsDocument, options);
        }
export type NetworkStatsQueryHookResult = ReturnType<typeof useNetworkStatsQuery>;
export type NetworkStatsLazyQueryHookResult = ReturnType<typeof useNetworkStatsLazyQuery>;
export type NetworkStatsQueryResult = Apollo.QueryResult<NetworkStatsQuery, NetworkStatsQueryVariables>;
