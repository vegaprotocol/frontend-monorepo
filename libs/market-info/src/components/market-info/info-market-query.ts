import { gql } from '@apollo/client';

export const MARKET_INFO_QUERY = gql`
  query MarketInfoQuery($marketId: ID!, $interval: Interval!, $since: String!) {
    market(id: $marketId) {
      id
      decimalPlaces
      positionDecimalPlaces
      state
      tradingMode
      proposal {
        id
        rationale {
          title
          description
        }
      }
      accounts {
        type
        asset {
          id
        }
        balance
      }
      tradingMode
      fees {
        factors {
          makerFee
          infrastructureFee
          liquidityFee
        }
      }
      priceMonitoringSettings {
        parameters {
          triggers {
            horizonSecs
            probability
            auctionExtensionSecs
          }
        }
      }
      data {
        market {
          id
        }
        markPrice
        bestBidVolume
        bestOfferVolume
        bestStaticBidVolume
        bestStaticOfferVolume
        bestBidPrice
        bestOfferPrice
        trigger
        openInterest
        suppliedStake
        openInterest
        targetStake
        marketValueProxy
        priceMonitoringBounds {
          minValidPrice
          maxValidPrice
          trigger {
            horizonSecs
            probability
            auctionExtensionSecs
          }
          referencePrice
        }
      }
      liquidityMonitoringParameters {
        triggeringRatio
        targetStakeParameters {
          timeWindow
          scalingFactor
        }
      }
      candlesConnection(interval: $interval, since: $since) {
        edges {
          node {
            volume
          }
        }
      }
      tradableInstrument {
        instrument {
          id
          name
          code
          metadata {
            tags
          }
          product {
            ... on Future {
              quoteName
              settlementAsset {
                id
                symbol
                name
                decimals
              }
              oracleSpecForSettlementPrice {
                id
              }
              oracleSpecForTradingTermination {
                id
              }
              oracleSpecBinding {
                settlementPriceProperty
                tradingTerminationProperty
              }
            }
          }
        }
        riskModel {
          ... on LogNormalRiskModel {
            tau
            riskAversionParameter
            params {
              r
              sigma
              mu
            }
          }
          ... on SimpleRiskModel {
            params {
              factorLong
              factorShort
            }
          }
        }
      }
      depth {
        lastTrade {
          price
        }
      }
    }
  }
`;
