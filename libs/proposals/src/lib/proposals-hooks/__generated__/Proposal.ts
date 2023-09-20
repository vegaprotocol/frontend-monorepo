import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { UpdateNetworkParameterFieldsFragmentDoc } from '../../proposals-data-provider/__generated__/Proposals';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalEventFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null };

export type ProposalEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ProposalEventSubscription = { __typename?: 'Subscription', proposals: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null } };

export type UpdateNetworkParameterProposalFragment = { __typename?: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, terms: { __typename?: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } };

export type OnUpdateNetworkParametersSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type OnUpdateNetworkParametersSubscription = { __typename?: 'Subscription', proposals: { __typename?: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, terms: { __typename?: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } } };

export type ProposalOfMarketQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type ProposalOfMarketQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id?: string | null, terms: { __typename?: 'ProposalTerms', enactmentDatetime?: any | null } } | null };

export type SuccessorMarketProposalDetailsQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
}>;


export type SuccessorMarketProposalDetailsQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id?: string | null, terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string, insurancePoolFraction: string } | null } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } } | null };

export type InstrumentDetailsQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type InstrumentDetailsQuery = { __typename?: 'Query', market?: { __typename?: 'Market', tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string, name: string } } } | null };

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
        ...UpdateNetworkParameterFields
      }
    }
  }
}
    ${UpdateNetworkParameterFieldsFragmentDoc}`;
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
export const SuccessorMarketProposalDetailsDocument = gql`
    query SuccessorMarketProposalDetails($proposalId: ID!) {
  proposal(id: $proposalId) {
    id
    terms {
      change {
        ... on NewMarket {
          successorConfiguration {
            parentMarketId
            insurancePoolFraction
          }
        }
      }
    }
  }
}
    `;

/**
 * __useSuccessorMarketProposalDetailsQuery__
 *
 * To run a query within a React component, call `useSuccessorMarketProposalDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSuccessorMarketProposalDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSuccessorMarketProposalDetailsQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useSuccessorMarketProposalDetailsQuery(baseOptions: Apollo.QueryHookOptions<SuccessorMarketProposalDetailsQuery, SuccessorMarketProposalDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SuccessorMarketProposalDetailsQuery, SuccessorMarketProposalDetailsQueryVariables>(SuccessorMarketProposalDetailsDocument, options);
      }
export function useSuccessorMarketProposalDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SuccessorMarketProposalDetailsQuery, SuccessorMarketProposalDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SuccessorMarketProposalDetailsQuery, SuccessorMarketProposalDetailsQueryVariables>(SuccessorMarketProposalDetailsDocument, options);
        }
export type SuccessorMarketProposalDetailsQueryHookResult = ReturnType<typeof useSuccessorMarketProposalDetailsQuery>;
export type SuccessorMarketProposalDetailsLazyQueryHookResult = ReturnType<typeof useSuccessorMarketProposalDetailsLazyQuery>;
export type SuccessorMarketProposalDetailsQueryResult = Apollo.QueryResult<SuccessorMarketProposalDetailsQuery, SuccessorMarketProposalDetailsQueryVariables>;
export const InstrumentDetailsDocument = gql`
    query InstrumentDetails($marketId: ID!) {
  market(id: $marketId) {
    tradableInstrument {
      instrument {
        code
        name
      }
    }
  }
}
    `;

/**
 * __useInstrumentDetailsQuery__
 *
 * To run a query within a React component, call `useInstrumentDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useInstrumentDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInstrumentDetailsQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useInstrumentDetailsQuery(baseOptions: Apollo.QueryHookOptions<InstrumentDetailsQuery, InstrumentDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InstrumentDetailsQuery, InstrumentDetailsQueryVariables>(InstrumentDetailsDocument, options);
      }
export function useInstrumentDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InstrumentDetailsQuery, InstrumentDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InstrumentDetailsQuery, InstrumentDetailsQueryVariables>(InstrumentDetailsDocument, options);
        }
export type InstrumentDetailsQueryHookResult = ReturnType<typeof useInstrumentDetailsQuery>;
export type InstrumentDetailsLazyQueryHookResult = ReturnType<typeof useInstrumentDetailsLazyQuery>;
export type InstrumentDetailsQueryResult = Apollo.QueryResult<InstrumentDetailsQuery, InstrumentDetailsQueryVariables>;