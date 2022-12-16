import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerProposalsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerProposalsQuery = { __typename?: 'Query', proposalsConnection?: { __typename?: 'ProposalsConnection', edges?: Array<{ __typename?: 'ProposalEdge', node: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'NewAsset', symbol: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket', marketId: string } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: any, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, votes?: Array<{ __typename?: 'Vote', value: Types.VoteValue, datetime: any, party: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } }> | null } } } } | null> | null } | null };


export const ExplorerProposalsDocument = gql`
    query ExplorerProposals {
  proposalsConnection {
    edges {
      node {
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
    }
  }
}
    `;

/**
 * __useExplorerProposalsQuery__
 *
 * To run a query within a React component, call `useExplorerProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerProposalsQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerProposalsQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerProposalsQuery, ExplorerProposalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerProposalsQuery, ExplorerProposalsQueryVariables>(ExplorerProposalsDocument, options);
      }
export function useExplorerProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerProposalsQuery, ExplorerProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerProposalsQuery, ExplorerProposalsQueryVariables>(ExplorerProposalsDocument, options);
        }
export type ExplorerProposalsQueryHookResult = ReturnType<typeof useExplorerProposalsQuery>;
export type ExplorerProposalsLazyQueryHookResult = ReturnType<typeof useExplorerProposalsLazyQuery>;
export type ExplorerProposalsQueryResult = Apollo.QueryResult<ExplorerProposalsQuery, ExplorerProposalsQueryVariables>;