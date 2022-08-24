import { gql } from '@apollo/client';

export const LIQUIDITY_QUERY = gql`
  query Liquidity($marketId: ID!) {
    market(id: $marketId) {
      id
      decimalPlaces
      positionDecimalPlaces
      tradableInstrument {
        instrument {
          code
          product {
            ... on Future {
              settlementAsset {
                id
                symbol
                decimals
              }
            }
          }
        }
      }
      liquidityProvisionsConnection {
        edges {
          node {
            id
            party {
              id
              accountsConnection {
                edges {
                  node {
                    type
                    balance
                  }
                }
              }
            }
            createdAt
            updatedAt
            commitmentAmount
            fee
            status
          }
        }
      }
      data {
        market {
          id
        }
        suppliedStake
        openInterest
        targetStake
        marketValueProxy
        liquidityProviderFeeShare {
          party {
            id
          }
          equityLikeShare
          averageEntryValuation
        }
      }
    }
  }
`;
