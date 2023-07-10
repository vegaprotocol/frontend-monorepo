import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type VoteEventFieldsFragment = { __typename: 'ProposalVote', proposalId: string, vote: { __typename: 'Vote', value: Types.VoteValue, datetime: any } };

export type VoteEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type VoteEventSubscription = { __typename: 'Subscription', votes: { __typename: 'ProposalVote', proposalId: string, vote: { __typename: 'Vote', value: Types.VoteValue, datetime: any } } };

export const VoteEventFieldsFragmentDoc = gql`
    fragment VoteEventFields on ProposalVote {
  proposalId
  vote {
    value
    datetime
  }
}
    `;
export const VoteEventDocument = gql`
    subscription VoteEvent($partyId: ID!) {
  votes(partyId: $partyId) {
    ...VoteEventFields
  }
}
    ${VoteEventFieldsFragmentDoc}`;

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