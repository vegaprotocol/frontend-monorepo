import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename: 'NewAsset', name: string, symbol: string, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', symbol: string } } | null } } | { __typename?: 'UpdateAsset', quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null } } };

export type ProposalQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename: 'NewAsset', name: string, symbol: string, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', symbol: string } } | null } } | { __typename?: 'UpdateAsset', quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null } } } | null };

export type ProposalsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProposalsQuery = { __typename?: 'Query', proposals?: Array<{ __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename: 'NewAsset', name: string, symbol: string, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', symbol: string } } | null } } | { __typename?: 'UpdateAsset', quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null } } }> | null };

export const ProposalFieldsFragmentDoc = gql`
    fragment ProposalFields on Proposal {
  id
  reference
  state
  datetime
  rejectionReason
  errorDetails
  party {
    id
  }
  terms {
    closingDatetime
    enactmentDatetime
    change {
      ... on NewMarket {
        decimalPlaces
        metadata
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
            __typename
            maxFaucetAmountMint
          }
          ... on ERC20 {
            __typename
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
      ... on UpdateAsset {
        quantum
        source {
          ... on UpdateERC20 {
            lifetimeLimit
            withdrawThreshold
          }
        }
      }
    }
  }
  votes {
    yes {
      totalTokens
      totalNumber
      totalEquityLikeShareWeight
      votes {
        value
        party {
          id
          stake {
            currentStakeAvailable
          }
        }
        datetime
      }
    }
    no {
      totalTokens
      totalNumber
      totalEquityLikeShareWeight
      votes {
        value
        party {
          id
          stake {
            currentStakeAvailable
          }
        }
        datetime
      }
    }
  }
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
  proposals {
    ...ProposalFields
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