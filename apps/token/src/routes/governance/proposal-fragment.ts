import { gql } from '@apollo/client';

export const PROPOSAL_FRAGMENT = gql`
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
