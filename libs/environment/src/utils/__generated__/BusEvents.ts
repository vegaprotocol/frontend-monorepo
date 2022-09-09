import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type BlockTimeSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type BlockTimeSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', eventId: string }> | null };


export const BlockTimeDocument = gql`
    subscription BlockTime {
  busEvents(types: TimeUpdate, batchSize: 1) {
    eventId
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