import { gql } from '@apollo/client';

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
