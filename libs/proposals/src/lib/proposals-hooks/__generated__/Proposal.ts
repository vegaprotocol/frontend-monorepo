import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { UpdateNetworkParameterFielsFragmentDoc } from '../../proposals-data-provider/__generated__/Proposals';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalEventFieldsFragment = { __typename: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null };

export type ProposalEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ProposalEventSubscription = { __typename: 'Subscription', proposals: { __typename: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null } };

export type UpdateNetworkParameterProposalFragment = { __typename: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, terms: { __typename: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename: 'NewAsset' } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket' } | { __typename: 'UpdateAsset' } | { __typename: 'UpdateMarket' } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename: 'NetworkParameter', key: string, value: string } } } };

export type OnUpdateNetworkParametersSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type OnUpdateNetworkParametersSubscription = { __typename: 'Subscription', proposals: { __typename: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, terms: { __typename: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename: 'NewAsset' } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket' } | { __typename: 'UpdateAsset' } | { __typename: 'UpdateMarket' } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename: 'NetworkParameter', key: string, value: string } } } } };

export type ProposalOfMarketQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type ProposalOfMarketQuery = { __typename: 'Query', proposal?: { __typename: 'Proposal', id?: string | null, terms: { __typename: 'ProposalTerms', enactmentDatetime?: any | null } } | null };

export const ProposalEventFieldsFragmentDoc = gql`
    fragment ProposalEventFields on Proposal {
  id
  reference
  state
  rejectionReason
  errorDetails
}
    `;
export const UpdateNetworkParameterProposalFragmentDoc = gql`
    fragment UpdateNetworkParameterProposal on Proposal {
  id
  state
  datetime
  terms {
    enactmentDatetime
    change {
      ... on UpdateNetworkParameter {
        ...UpdateNetworkParameterFiels
      }
    }
  }
}
    ${UpdateNetworkParameterFielsFragmentDoc}`;
export const ProposalEventDocument = gql`
    subscription ProposalEvent($partyId: ID!) {
  proposals(partyId: $partyId) {
    ...ProposalEventFields
  }
}
    ${ProposalEventFieldsFragmentDoc}`;

/**
 * __useProposalEventSubscription__
 *
 * To run a query within a React component, call `useProposalEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useProposalEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useProposalEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<ProposalEventSubscription, ProposalEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ProposalEventSubscription, ProposalEventSubscriptionVariables>(ProposalEventDocument, options);
      }
export type ProposalEventSubscriptionHookResult = ReturnType<typeof useProposalEventSubscription>;
export type ProposalEventSubscriptionResult = Apollo.SubscriptionResult<ProposalEventSubscription>;
export const OnUpdateNetworkParametersDocument = gql`
    subscription OnUpdateNetworkParameters {
  proposals {
    ...UpdateNetworkParameterProposal
  }
}
    ${UpdateNetworkParameterProposalFragmentDoc}`;

/**
 * __useOnUpdateNetworkParametersSubscription__
 *
 * To run a query within a React component, call `useOnUpdateNetworkParametersSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnUpdateNetworkParametersSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnUpdateNetworkParametersSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnUpdateNetworkParametersSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnUpdateNetworkParametersSubscription, OnUpdateNetworkParametersSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnUpdateNetworkParametersSubscription, OnUpdateNetworkParametersSubscriptionVariables>(OnUpdateNetworkParametersDocument, options);
      }
export type OnUpdateNetworkParametersSubscriptionHookResult = ReturnType<typeof useOnUpdateNetworkParametersSubscription>;
export type OnUpdateNetworkParametersSubscriptionResult = Apollo.SubscriptionResult<OnUpdateNetworkParametersSubscription>;
export const ProposalOfMarketDocument = gql`
    query ProposalOfMarket($marketId: ID!) {
  proposal(id: $marketId) {
    id
    terms {
      enactmentDatetime
    }
  }
}
    `;

/**
 * __useProposalOfMarketQuery__
 *
 * To run a query within a React component, call `useProposalOfMarketQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalOfMarketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalOfMarketQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useProposalOfMarketQuery(baseOptions: Apollo.QueryHookOptions<ProposalOfMarketQuery, ProposalOfMarketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalOfMarketQuery, ProposalOfMarketQueryVariables>(ProposalOfMarketDocument, options);
      }
export function useProposalOfMarketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalOfMarketQuery, ProposalOfMarketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalOfMarketQuery, ProposalOfMarketQueryVariables>(ProposalOfMarketDocument, options);
        }
export type ProposalOfMarketQueryHookResult = ReturnType<typeof useProposalOfMarketQuery>;
export type ProposalOfMarketLazyQueryHookResult = ReturnType<typeof useProposalOfMarketLazyQuery>;
export type ProposalOfMarketQueryResult = Apollo.QueryResult<ProposalOfMarketQuery, ProposalOfMarketQueryVariables>;