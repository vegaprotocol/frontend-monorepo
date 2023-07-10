import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NodeCheckQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NodeCheckQuery = { __typename: 'Query', statistics: { __typename: 'Statistics', chainId: string, blockHeight: string, vegaTime: any } };

export type NodeCheckTimeUpdateSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type NodeCheckTimeUpdateSubscription = { __typename: 'Subscription', busEvents?: Array<{ __typename: 'BusEvent', id: string }> | null };


export const NodeCheckDocument = gql`
    query NodeCheck {
  statistics {
    chainId
    blockHeight
    vegaTime
  }
}
    `;

/**
 * __useNodeCheckQuery__
 *
 * To run a query within a React component, call `useNodeCheckQuery` and pass it any options that fit your needs.
 * When your component renders, `useNodeCheckQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNodeCheckQuery({
 *   variables: {
 *   },
 * });
 */
export function useNodeCheckQuery(baseOptions?: Apollo.QueryHookOptions<NodeCheckQuery, NodeCheckQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NodeCheckQuery, NodeCheckQueryVariables>(NodeCheckDocument, options);
      }
export function useNodeCheckLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NodeCheckQuery, NodeCheckQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NodeCheckQuery, NodeCheckQueryVariables>(NodeCheckDocument, options);
        }
export type NodeCheckQueryHookResult = ReturnType<typeof useNodeCheckQuery>;
export type NodeCheckLazyQueryHookResult = ReturnType<typeof useNodeCheckLazyQuery>;
export type NodeCheckQueryResult = Apollo.QueryResult<NodeCheckQuery, NodeCheckQueryVariables>;
export const NodeCheckTimeUpdateDocument = gql`
    subscription NodeCheckTimeUpdate {
  busEvents(types: TimeUpdate, batchSize: 1) {
    id
  }
}
    `;

/**
 * __useNodeCheckTimeUpdateSubscription__
 *
 * To run a query within a React component, call `useNodeCheckTimeUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNodeCheckTimeUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNodeCheckTimeUpdateSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNodeCheckTimeUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<NodeCheckTimeUpdateSubscription, NodeCheckTimeUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NodeCheckTimeUpdateSubscription, NodeCheckTimeUpdateSubscriptionVariables>(NodeCheckTimeUpdateDocument, options);
      }
export type NodeCheckTimeUpdateSubscriptionHookResult = ReturnType<typeof useNodeCheckTimeUpdateSubscription>;
export type NodeCheckTimeUpdateSubscriptionResult = Apollo.SubscriptionResult<NodeCheckTimeUpdateSubscription>;