import { gql } from '@apollo/client';

const LIQUIDITY_PROVISIONS_FRAGMENT = gql`
  fragment LiquidityProvisionsConnectionFields on LiquidityProvision {
    id
    party {
      id
    }
    createdAt
    updatedAt
    commitmentAmount
    fee
    status
  }
`;

const LIQUIDITY_PROVIDERS_FEE_SHARE_FRAGMENT = gql`
  fragment LiquidityProviderFeeShareFields on LiquidityProviderFeeShare {
    party {
      id
    }
    equityLikeShare
    averageEntryValuation
  }
`;

export const MARKET_LIQUIDITY_QUERY = gql`
  query MarketLiquidity($marketId: ID!) {
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
            ...LiquidityProvisionsConnectionFields
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
          ...LiquidityProviderFeeShareFields
        }
      }
    }
  }
`;
