import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SimpleTransactionFieldsFragment = { __typename?: 'TransactionResult', partyId: string, hash: string, status: boolean, error?: string | null };

export type SimpleTransactionSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type SimpleTransactionSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'Deposit' } | { __typename?: 'TimeUpdate' } | { __typename?: 'TransactionResult', partyId: string, hash: string, status: boolean, error?: string | null } | { __typename?: 'Withdrawal' } }> | null };

export const SimpleTransactionFieldsFragmentDoc = gql`
    fragment SimpleTransactionFields on TransactionResult {
  partyId
  hash
  status
  error
}
    `;
export const SimpleTransactionDocument = gql`
    subscription SimpleTransaction($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [TransactionResult]) {
    type
    event {
      ... on TransactionResult {
        ...SimpleTransactionFields
      }
    }
  }
}
    ${SimpleTransactionFieldsFragmentDoc}`;

/**
 * __useSimpleTransactionSubscription__
 *
 * To run a query within a React component, call `useSimpleTransactionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSimpleTransactionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSimpleTransactionSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useSimpleTransactionSubscription(baseOptions: Apollo.SubscriptionHookOptions<SimpleTransactionSubscription, SimpleTransactionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SimpleTransactionSubscription, SimpleTransactionSubscriptionVariables>(SimpleTransactionDocument, options);
      }
export type SimpleTransactionSubscriptionHookResult = ReturnType<typeof useSimpleTransactionSubscription>;
export type SimpleTransactionSubscriptionResult = Apollo.SubscriptionResult<SimpleTransactionSubscription>;