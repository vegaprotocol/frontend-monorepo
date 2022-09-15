import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename: 'NewAsset', name: string, symbol: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', symbol: string } } | null } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null } } };

export type ProposalQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename: 'NewAsset', name: string, symbol: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', symbol: string } } | null } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null } } } };

export type ProposalsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProposalsQuery = { __typename?: 'Query', proposalsConnection: { __typename?: 'ProposalsConnection', edges?: Array<{ __typename?: 'ProposalEdge', node: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename: 'NewAsset', name: string, symbol: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', symbol: string } } | null } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null } } } } | null> | null } };

export type ProposalEventFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null };

export type ProposalEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ProposalEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'Account' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

export const ProposalFieldsFragmentDoc = gql`
    fragment ProposalFields on Proposal {
  id
  rationale {
    title
    description
  }
  reference
  state
  datetime
  rejectionReason
  party {
    id
  }
  errorDetails
  terms {
    closingDatetime
    enactmentDatetime
    change {
      ... on NewMarket {
        instrument {
          name
          code
          futureProduct {
            settlementAsset {
              symbol
            }
          }
        }
      }
      ... on UpdateMarket {
        marketId
      }
      ... on NewAsset {
        __typename
        name
        symbol
        source {
          ... on BuiltinAsset {
            maxFaucetAmountMint
          }
          ... on ERC20 {
            contractAddress
          }
        }
      }
      ... on UpdateNetworkParameter {
        networkParameter {
          key
          value
        }
      }
    }
  }
  votes {
    yes {
      totalTokens
      totalNumber
      votes {
        value
        party {
          id
          stakingSummary {
            currentStakeAvailable
          }
        }
        datetime
      }
    }
    no {
      totalTokens
      totalNumber
      votes {
        value
        party {
          id
          stakingSummary {
            currentStakeAvailable
          }
        }
        datetime
      }
    }
  }
}
    `;
export const ProposalEventFieldsFragmentDoc = gql`
    fragment ProposalEventFields on Proposal {
  id
  reference
  state
  rejectionReason
  errorDetails
}
    `;
export const ProposalDocument = gql`
    query Proposal($proposalId: ID!) {
  proposal(id: $proposalId) {
    ...ProposalFields
  }
}
    ${ProposalFieldsFragmentDoc}`;

/**
 * __useProposalQuery__
 *
 * To run a query within a React component, call `useProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useProposalQuery(baseOptions: Apollo.QueryHookOptions<ProposalQuery, ProposalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, options);
      }
export function useProposalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalQuery, ProposalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, options);
        }
export type ProposalQueryHookResult = ReturnType<typeof useProposalQuery>;
export type ProposalLazyQueryHookResult = ReturnType<typeof useProposalLazyQuery>;
export type ProposalQueryResult = Apollo.QueryResult<ProposalQuery, ProposalQueryVariables>;
export const ProposalsDocument = gql`
    query Proposals {
  proposalsConnection {
    edges {
      node {
        ...ProposalFields
      }
    }
  }
}
    ${ProposalFieldsFragmentDoc}`;

/**
 * __useProposalsQuery__
 *
 * To run a query within a React component, call `useProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsQuery({
 *   variables: {
 *   },
 * });
 */
export function useProposalsQuery(baseOptions?: Apollo.QueryHookOptions<ProposalsQuery, ProposalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
      }
export function useProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalsQuery, ProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
        }
export type ProposalsQueryHookResult = ReturnType<typeof useProposalsQuery>;
export type ProposalsLazyQueryHookResult = ReturnType<typeof useProposalsLazyQuery>;
export type ProposalsQueryResult = Apollo.QueryResult<ProposalsQuery, ProposalsQueryVariables>;
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