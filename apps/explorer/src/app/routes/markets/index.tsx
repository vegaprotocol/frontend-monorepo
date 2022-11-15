import { gql, useQuery } from '@apollo/client';
import type { MarketsQuery } from './__generated__/MarketsQuery';

import React from 'react';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { t } from '@vegaprotocol/react-helpers';


// Migrated to query v2
const MARKETS_QUERY = gql`
  query MarketsQuery {
      marketsConnection {
        edges {
          node {
            id
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
            accountsConnection {
              edges {
                node {
                    asset {
                      id
                      name
                    }
                    balance
                    type
                  }                
                }
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
    }
  }
`;

const Markets = () => {
  const { data } = useQuery<MarketsQuery>(MARKETS_QUERY);

  return (
    <section>
      <RouteTitle data-testid="markets-heading">{t('Markets')}</RouteTitle>

      {data?.markets
        ? data.markets.map((m) => (
            <React.Fragment key={m.id}>
              <SubHeading data-testid="markets-header">
                {m.tradableInstrument.instrument.name}
              </SubHeading>
              <SyntaxHighlighter data={m} />
            </React.Fragment>
          ))
        : null}
    </section>
  );
};

export default Markets;
