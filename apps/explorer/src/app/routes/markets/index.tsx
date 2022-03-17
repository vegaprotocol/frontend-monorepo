import { gql, useQuery } from '@apollo/client';
import { MarketsQuery } from '@vegaprotocol/graphql';

import React from 'react';
import { SyntaxHighlighter } from '../../components/syntax-highlighter';
import { RouteTitle } from '../../components/route-title';

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

  if (!data || !data.markets) return null;
  return (
    <section className="px-8 py-12">
      <RouteTitle data-testid="markets-header">Markets</RouteTitle>

      {data
        ? data.markets.map((m) => (
            <React.Fragment key={m.id}>
              <h2 data-testid="markets-header">{m.name}</h2>
              <SyntaxHighlighter data={m} />
            </React.Fragment>
          ))
        : null}
    </section>
  );
};

export default Markets;
