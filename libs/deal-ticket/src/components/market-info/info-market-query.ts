import { gql } from '@apollo/client';

export const MARKET_INFO_QUERY = gql`
  query MarketInfoQuery($marketId: ID!, $interval: Interval!, $since: String!) {
    market(id: $marketId) {
      id
      name
      decimalPlaces
      positionDecimalPlaces
      state
      accounts {
        type
        asset {
          id
        }
        balance
      }
      tradingMode
      accounts {
        type
        asset {
          id
        }
        balance
      }
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
      riskFactors {
        market
        short
        long
      }
      accounts {
        type
        asset {
          id
        }
        balance
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
      candles(interval: $interval, since: $since) {
        volume
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
