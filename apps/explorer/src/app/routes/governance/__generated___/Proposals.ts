import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalsQueryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProposalsQueryQuery = { __typename?: 'Query', proposals?: Array<{ __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, rejectionReason?: Types.ProposalRejectionReason | null, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename: 'NewAsset', symbol: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: string, party: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string } } }> | null } } }> | null };


export const ProposalsQueryDocument = gql`
    query ProposalsQuery {
  proposals {
    id
    reference
    state
    datetime
    rejectionReason
    party {
      id
    }
    terms {
      closingDatetime
      enactmentDatetime
      change {
        ... on NewMarket {
          instrument {
            name
          }
        }
        ... on UpdateMarket {
          marketId
        }
        ... on NewAsset {
          __typename
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
}
    `;

/**
 * __useProposalsQueryQuery__
 *
 * To run a query within a React component, call `useProposalsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useProposalsQueryQuery(baseOptions?: Apollo.QueryHookOptions<ProposalsQueryQuery, ProposalsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalsQueryQuery, ProposalsQueryQueryVariables>(ProposalsQueryDocument, options);
      }
export function useProposalsQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalsQueryQuery, ProposalsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalsQueryQuery, ProposalsQueryQueryVariables>(ProposalsQueryDocument, options);
        }
export type ProposalsQueryQueryHookResult = ReturnType<typeof useProposalsQueryQuery>;
export type ProposalsQueryLazyQueryHookResult = ReturnType<typeof useProposalsQueryLazyQuery>;
export type ProposalsQueryQueryResult = Apollo.QueryResult<ProposalsQueryQuery, ProposalsQueryQueryVariables>;