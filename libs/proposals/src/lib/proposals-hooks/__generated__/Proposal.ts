import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { UpdateNetworkParameterFieldsFragmentDoc, NewTransferFieldsFragmentDoc, CancelTransferFieldsFragmentDoc } from '../../proposals-data-provider/__generated__/Proposals';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalEventFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null };

export type ProposalEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ProposalEventSubscription = { __typename?: 'Subscription', proposals: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null } };

export type OnProposalFragmentFragment = { __typename?: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, terms: { __typename?: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } };

export type OnProposalSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type OnProposalSubscription = { __typename?: 'Subscription', proposals: { __typename?: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, terms: { __typename?: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } } };

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

export type NewTransferDetailsQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
}>;


export type NewTransferDetailsQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id?: string | null, terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer', source: string, sourceType: Types.AccountType, destination: string, destinationType: Types.AccountType, fraction_of_balance: string, amount: string, transferType: Types.GovernanceTransferType, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number, quantum: string }, kind: { __typename: 'OneOffGovernanceTransfer', deliverOn?: any | null } | { __typename: 'RecurringGovernanceTransfer', startEpoch: number, endEpoch?: number | null } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } } | null };

export type CancelTransferDetailsQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
}>;


export type CancelTransferDetailsQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id?: string | null, terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer', transferId: string } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } } | null };

export const ProposalEventFieldsFragmentDoc = gql`
    fragment ProposalEventFields on Proposal {
  id
  reference
  state
  rejectionReason
  errorDetails
}
    `;
export const OnProposalFragmentFragmentDoc = gql`
    fragment OnProposalFragment on Proposal {
  id
  state
  datetime
  rationale {
    title
    description
  }
  rejectionReason
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
export const OnProposalDocument = gql`
    subscription OnProposal {
  proposals {
    ...OnProposalFragment
  }
}
    ${OnProposalFragmentFragmentDoc}`;

/**
 * __useOnProposalSubscription__
 *
 * To run a query within a React component, call `useOnProposalSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnProposalSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnProposalSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnProposalSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnProposalSubscription, OnProposalSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnProposalSubscription, OnProposalSubscriptionVariables>(OnProposalDocument, options);
      }
export type OnProposalSubscriptionHookResult = ReturnType<typeof useOnProposalSubscription>;
export type OnProposalSubscriptionResult = Apollo.SubscriptionResult<OnProposalSubscription>;
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
export const NewTransferDetailsDocument = gql`
    query NewTransferDetails($proposalId: ID!) {
  proposal(id: $proposalId) {
    id
    terms {
      change {
        ... on NewTransfer {
          ...NewTransferFields
        }
      }
    }
  }
}
    ${NewTransferFieldsFragmentDoc}`;

/**
 * __useNewTransferDetailsQuery__
 *
 * To run a query within a React component, call `useNewTransferDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNewTransferDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewTransferDetailsQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useNewTransferDetailsQuery(baseOptions: Apollo.QueryHookOptions<NewTransferDetailsQuery, NewTransferDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NewTransferDetailsQuery, NewTransferDetailsQueryVariables>(NewTransferDetailsDocument, options);
      }
export function useNewTransferDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NewTransferDetailsQuery, NewTransferDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NewTransferDetailsQuery, NewTransferDetailsQueryVariables>(NewTransferDetailsDocument, options);
        }
export type NewTransferDetailsQueryHookResult = ReturnType<typeof useNewTransferDetailsQuery>;
export type NewTransferDetailsLazyQueryHookResult = ReturnType<typeof useNewTransferDetailsLazyQuery>;
export type NewTransferDetailsQueryResult = Apollo.QueryResult<NewTransferDetailsQuery, NewTransferDetailsQueryVariables>;
export const CancelTransferDetailsDocument = gql`
    query CancelTransferDetails($proposalId: ID!) {
  proposal(id: $proposalId) {
    id
    terms {
      change {
        ... on CancelTransfer {
          ...CancelTransferFields
        }
      }
    }
  }
}
    ${CancelTransferFieldsFragmentDoc}`;

/**
 * __useCancelTransferDetailsQuery__
 *
 * To run a query within a React component, call `useCancelTransferDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCancelTransferDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCancelTransferDetailsQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useCancelTransferDetailsQuery(baseOptions: Apollo.QueryHookOptions<CancelTransferDetailsQuery, CancelTransferDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CancelTransferDetailsQuery, CancelTransferDetailsQueryVariables>(CancelTransferDetailsDocument, options);
      }
export function useCancelTransferDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CancelTransferDetailsQuery, CancelTransferDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CancelTransferDetailsQuery, CancelTransferDetailsQueryVariables>(CancelTransferDetailsDocument, options);
        }
export type CancelTransferDetailsQueryHookResult = ReturnType<typeof useCancelTransferDetailsQuery>;
export type CancelTransferDetailsLazyQueryHookResult = ReturnType<typeof useCancelTransferDetailsLazyQuery>;
export type CancelTransferDetailsQueryResult = Apollo.QueryResult<CancelTransferDetailsQuery, CancelTransferDetailsQueryVariables>;