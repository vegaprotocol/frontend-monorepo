import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type VoteEventFieldsFragment = { __typename?: 'Vote', proposalId: string, value: Types.VoteValue, datetime: any };

export type VoteEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type VoteEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote', proposalId: string, value: Types.VoteValue, datetime: any } | { __typename?: 'Withdrawal' } }> | null };

export const VoteEventFieldsFragmentDoc = gql`
    fragment VoteEventFields on Vote {
  proposalId
  value
  datetime
}
    `;
export const VoteEventDocument = gql`
    subscription VoteEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Vote]) {
    type
    event {
      ... on Vote {
        proposalId
        value
        datetime
      }
    }
  }
}
    `;

/**
 * __useVoteEventSubscription__
 *
 * To run a query within a React component, call `useVoteEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useVoteEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVoteEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useVoteEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<VoteEventSubscription, VoteEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<VoteEventSubscription, VoteEventSubscriptionVariables>(VoteEventDocument, options);
      }
export type VoteEventSubscriptionHookResult = ReturnType<typeof useVoteEventSubscription>;
export type VoteEventSubscriptionResult = Apollo.SubscriptionResult<VoteEventSubscription>;