import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import type {
  Proposal as ProposalQueryResult,
  ProposalVariables,
} from './__generated__/Proposal';

export const PROPOSAL_QUERY = gql`
  query Proposal($proposalId: ID!) {
    proposal(id: $proposalId) {
      id
      rationale {
        title
        description
      }
      reference
      state
      datetime
      rejectionReason
      party {
        id
      }
      errorDetails
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
                  id
                  name
                  symbol
                  decimals
                  quantum
                }
                quoteName
                settlementDataDecimals
                oracleSpecForSettlementData {
                  pubKeys
                  filters {
                    key {
                      name
                      type
                    }
                    conditions {
                      operator
                      value
                    }
                  }
                }
                oracleSpecForTradingTermination {
                  pubKeys
                  filters {
                    key {
                      name
                      type
                    }
                    conditions {
                      operator
                      value
                    }
                  }
                }
                oracleSpecBinding {
                  settlementDataProperty
                  tradingTerminationProperty
                }
              }
            }
          }
          ... on UpdateMarket {
            marketId
            updateMarketConfiguration {
              instrument {
                code
                product {
                  quoteName
                  oracleSpecForSettlementData {
                    pubKeys
                    filters {
                      key {
                        name
                        type
                      }
                      conditions {
                        operator
                        value
                      }
                    }
                  }
                  oracleSpecForTradingTermination {
                    pubKeys
                    filters {
                      key {
                        name
                        type
                      }
                      conditions {
                        operator
                        value
                      }
                    }
                  }
                  oracleSpecBinding {
                    settlementDataProperty
                    tradingTerminationProperty
                  }
                }
              }
              metadata
              priceMonitoringParameters {
                triggers {
                  horizonSecs
                  probability
                  auctionExtensionSecs
                }
              }
              liquidityMonitoringParameters {
                triggeringRatio
                targetStakeParameters {
                  timeWindow
                  scalingFactor
                }
              }
              riskParameters {
                ... on UpdateMarketSimpleRiskModel {
                  simple {
                    factorLong
                    factorShort
                  }
                }
                ... on UpdateMarketLogNormalRiskModel {
                  logNormal {
                    riskAversionParameter
                    tau
                    params {
                      r
                      sigma
                      mu
                    }
                  }
                }
              }
            }
          }
          ... on NewAsset {
            name
            symbol
            decimals
            quantum
            source {
              ... on BuiltinAsset {
                maxFaucetAmountMint
              }
              ... on ERC20 {
                contractAddress
                lifetimeLimit
                withdrawThreshold
              }
            }
          }
          ... on UpdateNetworkParameter {
            networkParameter {
              key
              value
            }
          }
          ... on UpdateAsset {
            quantum
            assetId
            source {
              ... on UpdateERC20 {
                lifetimeLimit
                withdrawThreshold
              }
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
              stakingSummary {
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
              stakingSummary {
                currentStakeAvailable
              }
            }
            datetime
          }
        }
      }
    }
  }
`;

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();
  const { data, loading, error, refetch } = useQuery<
    ProposalQueryResult,
    ProposalVariables
  >(PROPOSAL_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
  });

  useEffect(() => {
    const interval = setInterval(refetch, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data?.proposal ? (
        <Proposal proposal={data.proposal} />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
