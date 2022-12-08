import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TransactionEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type TransactionEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult', partyId: string, hash: string, status: boolean, error?: string | null } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };


export const TransactionEventDocument = gql`
    subscription TransactionEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [TransactionResult]) {
    type
    event {
      ... on TransactionResult {
        partyId
        hash
        status
        error
      }
    }
  }
}
    `;

/**
 * __useTransactionEventSubscription__
 *
 * To run a query within a React component, call `useTransactionEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTransactionEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransactionEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useTransactionEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<TransactionEventSubscription, TransactionEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TransactionEventSubscription, TransactionEventSubscriptionVariables>(TransactionEventDocument, options);
      }
export type TransactionEventSubscriptionHookResult = ReturnType<typeof useTransactionEventSubscription>;
export type TransactionEventSubscriptionResult = Apollo.SubscriptionResult<TransactionEventSubscription>;