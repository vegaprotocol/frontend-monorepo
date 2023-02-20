import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type StatisticsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type StatisticsQuery = { __typename?: 'Query', statistics: { __typename?: 'Statistics', chainId: string, blockHeight: string, vegaTime: any } };

export type BlockTimeSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type BlockTimeSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', id: string }> | null };


export const StatisticsDocument = gql`
    query Statistics {
  statistics {
    chainId
    blockHeight
    vegaTime
  }
}
    `;

/**
 * __useStatisticsQuery__
 *
 * To run a query within a React component, call `useStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStatisticsQuery({
 *   variables: {
 *   },
 * });
 */
export function useStatisticsQuery(baseOptions?: Apollo.QueryHookOptions<StatisticsQuery, StatisticsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StatisticsQuery, StatisticsQueryVariables>(StatisticsDocument, options);
      }
export function useStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StatisticsQuery, StatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StatisticsQuery, StatisticsQueryVariables>(StatisticsDocument, options);
        }
export type StatisticsQueryHookResult = ReturnType<typeof useStatisticsQuery>;
export type StatisticsLazyQueryHookResult = ReturnType<typeof useStatisticsLazyQuery>;
export type StatisticsQueryResult = Apollo.QueryResult<StatisticsQuery, StatisticsQueryVariables>;
export const BlockTimeDocument = gql`
    subscription BlockTime {
  busEvents(types: TimeUpdate, batchSize: 1) {
    id
  }
}
    `;

/**
 * __useBlockTimeSubscription__
 *
 * To run a query within a React component, call `useBlockTimeSubscription` and pass it any options that fit your needs.
 * When your component renders, `useBlockTimeSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBlockTimeSubscription({
 *   variables: {
 *   },
 * });
 */
export function useBlockTimeSubscription(baseOptions?: Apollo.SubscriptionHookOptions<BlockTimeSubscription, BlockTimeSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<BlockTimeSubscription, BlockTimeSubscriptionVariables>(BlockTimeDocument, options);
      }
export type BlockTimeSubscriptionHookResult = ReturnType<typeof useBlockTimeSubscription>;
export type BlockTimeSubscriptionResult = Apollo.SubscriptionResult<BlockTimeSubscription>;