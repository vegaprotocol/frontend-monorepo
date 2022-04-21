import { gql } from "@apollo/client";

export const PROPOSALS_FRAGMENT = gql`
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
        ... on NewFreeform {
          url
          description
          hash
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
`;
