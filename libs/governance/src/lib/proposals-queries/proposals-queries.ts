import { gql, useQuery } from '@apollo/client';
import type { Proposal, ProposalVariables } from './__generated__/Proposal';
import type {
  ProposalsConnection,
  ProposalsConnection_proposalsConnection_edges_node as ProposalNode,
} from './__generated__/ProposalsConnection';

const PROPOSALS_FRAGMENT = gql`
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

export const PROPOSALS_QUERY = gql`
  ${PROPOSALS_FRAGMENT}
  query ProposalsConnection {
    proposalsConnection {
      edges {
        node {
          ...ProposalFields
        }
      }
    }
  }
`;

export const PROPOSAL_QUERY = gql`
  ${PROPOSALS_FRAGMENT}
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      ...ProposalFields
    }
  }
`;

export const useProposalsQuery = (withPolling = false) =>
  useQuery<ProposalsConnection, never>(PROPOSALS_QUERY, {
    ...(withPolling ? { pollInterval: 5000, fetchPolicy: 'network-only' } : {}),
    errorPolicy: 'ignore', // this is to get around some backend issues and should be removed in future
  });

export const getProposals = (data?: ProposalsConnection) => {
  const proposals = data?.proposalsConnection?.edges
    ?.filter((e) => e?.node)
    .map((e) => e?.node);
  return proposals ? (proposals as ProposalNode[]) : [];
};

export const useProposalQuery = (id?: string) =>
  useQuery<Proposal, ProposalVariables>(PROPOSAL_QUERY, {
    fetchPolicy: 'no-cache',
    variables: { proposalId: id || '' },
    skip: !id,
    pollInterval: 5000,
  });
