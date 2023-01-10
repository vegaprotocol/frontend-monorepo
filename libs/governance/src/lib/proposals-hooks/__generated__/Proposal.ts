import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalEventFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null };

export type ProposalEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ProposalEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

export type UpdateNetworkParameterFieldsFragment = { __typename?: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, terms: { __typename?: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } } };

export type OnUpdateNetworkParametersSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type OnUpdateNetworkParametersSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal', id?: string | null, state: Types.ProposalState, datetime: any, terms: { __typename?: 'ProposalTerms', enactmentDatetime?: any | null, change: { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } } } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

export const ProposalEventFieldsFragmentDoc = gql`
    fragment ProposalEventFields on Proposal {
  id
  reference
  state
  rejectionReason
  errorDetails
}
    `;
export const UpdateNetworkParameterFieldsFragmentDoc = gql`
    fragment UpdateNetworkParameterFields on Proposal {
  id
  state
  datetime
  terms {
    enactmentDatetime
    change {
      ... on UpdateNetworkParameter {
        networkParameter {
          key
          value
        }
      }
    }
  }
}
    `;
export const ProposalEventDocument = gql`
    subscription ProposalEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Proposal]) {
    type
    event {
      ... on Proposal {
        ...ProposalEventFields
      }
    }
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
  busEvents(types: [Proposal], batchSize: 0) {
    event {
      ... on Proposal {
        ...UpdateNetworkParameterFields
      }
    }
  }
}
    ${UpdateNetworkParameterFieldsFragmentDoc}`;

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