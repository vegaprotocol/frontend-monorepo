import { gql } from '@apollo/client';

export const MARKET_LIQUIDITY_QUERY = gql`
  query marketLiquidity($marketId: ID!) {
    market(id: $marketId) {
      id
      decimalPlaces
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
      liquidityProvisions {
        id
        party {
          id
          accounts(type: Bond, marketId: $marketId) {
            type
            balance
          }
        }
        createdAt
        updatedAt
        commitmentAmount
        fee
        status
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
