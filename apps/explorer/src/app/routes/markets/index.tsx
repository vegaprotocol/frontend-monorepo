import { gql, useQuery } from "@apollo/client";
import { MarketsQuery } from "./__generated__/MarketsQuery";

const MARKETS_QUERY = gql`
  query MarketsQuery {
    markets {
      id
      name
      fees {
        factors {
          makerFee
          infrastructureFee
          liquidityFee
        }
      }
      tradableInstrument {
        instrument {
          name
          metadata {
            tags
          }
          id
          code
          product {
            ... on Future {
              maturity
              settlementAsset {
                id
                name
                decimals
                totalSupply
                globalRewardPoolAccount {
                  balance
                }
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
        marginCalculator {
          scalingFactors {
            searchLevel
            initialMargin
            collateralRelease
          }
        }
      }
      decimalPlaces
      openingAuction {
        durationSecs
        volume
      }
      priceMonitoringSettings {
        parameters {
          triggers {
            horizonSecs
            probability
            auctionExtensionSecs
          }
        }
        updateFrequencySecs
      }
      liquidityMonitoringParameters {
        triggeringRatio
        targetStakeParameters {
          timeWindow
          scalingFactor
        }
      }
      tradingMode
      state
      proposal {
        id
      }
      state
      accounts {
        asset {
          id
          name
        }
        balance
        type
      }
      data {
        markPrice
        bestBidPrice
        bestBidVolume
        bestOfferPrice
        bestOfferVolume
        bestStaticBidPrice
        bestStaticBidVolume
        bestStaticOfferPrice
        bestStaticOfferVolume
        midPrice
        staticMidPrice
        timestamp
        openInterest
        auctionEnd
        auctionStart
        indicativePrice
        indicativeVolume
        trigger
        extensionTrigger
        targetStake
        suppliedStake
        priceMonitoringBounds {
          minValidPrice
          maxValidPrice
          trigger {
            auctionExtensionSecs
            probability
          }
          referencePrice
        }
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

const Markets = () => {
  const { data } = useQuery<MarketsQuery>(MARKETS_QUERY);
  return (
    <section>
      <h1>Markets</h1>
      <pre>{JSON.stringify(data, null, "  ")}</pre>
    </section>
  );
};

export default Markets;
