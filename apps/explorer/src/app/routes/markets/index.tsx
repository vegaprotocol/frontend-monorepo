import { gql, useQuery } from '@apollo/client';
import { MarketsQuery } from './__generated__/MarketsQuery';

import SyntaxHighlighter from 'react-syntax-highlighter';
import React from 'react';

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

const vegaJsonTheme = {
  hljs: {
    fontSize: '1rem',
    fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    display: 'block',
    overflowX: 'auto',
    padding: '1em',
    color: '#26ff8a',
    background: '#2C2C2C',
    border: '1px solid #696969',
  },
  'hljs-literal': {
    color: '#ff2d5e',
  },
  'hljs-number': {
    color: '#ff7a1a',
  },
  'hljs-string': {
    color: '#48aff0',
  },
};

const Markets = () => {
  const { data } = useQuery<MarketsQuery>(MARKETS_QUERY);

  if (!data || !data.markets) return null;
  return (
    <section>
      <h1>Markets</h1>
      {data.markets.map((m) => (
        <React.Fragment key={m.id}>
          <h2>{m.name}</h2>
          <SyntaxHighlighter language="json" style={vegaJsonTheme}>
            {JSON.stringify(m, null, '  ')}
          </SyntaxHighlighter>
        </React.Fragment>
      ))}
    </section>
  );
};

export default Markets;
