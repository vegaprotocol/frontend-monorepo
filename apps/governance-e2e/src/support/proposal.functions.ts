import { addSeconds, millisecondsToSeconds } from 'date-fns';
import type { ProposalSubmissionBody } from '@vegaprotocol/wallet';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { upgradeProposalsData } from '../fixtures/mocks/network-upgrade';
import { proposalsData } from '../fixtures/mocks/proposals';
import { nodeData } from '../fixtures/mocks/nodes';

export function createUpdateNetworkProposalTxBody(): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 5;
  const MIN_ENACT_SEC = 7;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Add New proposal with short enactment',
        description: 'E2E enactment test',
      },
      terms: {
        updateNetworkParameter: {
          changes: {
            key: 'governance.proposal.updateNetParam.minProposerBalance',
            value: '2',
          },
        },
        closingTimestamp,
        enactmentTimestamp,
      },
    },
  };
}

export function createUpdateAssetProposalTxBody(): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 5;
  const MIN_ENACT_SEC = 7;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Update Asset set to fail',
        description: 'E2E fail test',
      },
      terms: {
        updateAsset: {
          assetId:
            'ebcd94151ae1f0d39a4bde3b21a9c7ae81a80ea4352fb075a92e07608d9c953d',
          changes: {
            quantum: '1',
            erc20: {
              withdrawThreshold: '10',
              lifetimeLimit: '10',
            },
          },
        },
        closingTimestamp,
        enactmentTimestamp,
      },
    },
  };
}

export function createFreeFormProposalTxBody(): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 7;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Add New free form proposal with short enactment',
        description: 'E2E enactment test',
      },
      terms: {
        newFreeform: {},
        closingTimestamp,
      },
    },
  };
}

export function createNewMarketProposalTxBody(): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 5;
  const MIN_ENACT_SEC = 7;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'New Market Proposal E2E submission',
        description: 'E2E new market proposal',
      },
      terms: {
        newMarket: {
          changes: {
            decimalPlaces: '5',
            positionDecimalPlaces: '5',
            linearSlippageFactor: '0.001',
            liquiditySlaParameters: {
              priceRange: '0.5',
              commitmentMinTimeFraction: '0.1',
              performanceHysteresisEpochs: 2,
              slaCompetitionFactor: '0.1',
            },
            quadraticSlippageFactor: '0',
            instrument: {
              name: 'Token test market',
              code: 'TEST.24h',
              future: {
                settlementAsset:
                  '73174a6fb1d5802ba0ac7bd7ab79e0a3a4837b262de0a4e80815a55442692bd0',
                quoteName: 'fBTC',
                dataSourceSpecForSettlementData: {
                  external: {
                    oracle: {
                      signers: [
                        {
                          pubKey: {
                            key: '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680',
                          },
                        },
                      ],
                      filters: [
                        {
                          key: {
                            name: 'prices.ETH.value',
                            type: 'TYPE_INTEGER' as const,
                            numberDecimalPlaces: '0',
                          },
                          conditions: [
                            {
                              operator: 'OPERATOR_GREATER_THAN' as const,
                              value: '0',
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  external: {
                    oracle: {
                      signers: [
                        {
                          pubKey: {
                            key: '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680',
                          },
                        },
                      ],
                      filters: [
                        {
                          key: {
                            name: 'trading.terminated.ETH5',
                            type: 'TYPE_BOOLEAN' as const,
                          },
                          conditions: [
                            {
                              operator: 'OPERATOR_EQUALS' as const,
                              value: 'true',
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
                dataSourceSpecBinding: {
                  settlementDataProperty: 'prices.ETH.value',
                  tradingTerminationProperty: 'trading.terminated.ETH5',
                },
              },
            },
            metadata: ['sector:energy', 'sector:tech', 'source:docs.vega.xyz'],
            priceMonitoringParameters: {
              triggers: [
                {
                  horizon: '43200',
                  probability: '0.9999999',
                  auctionExtension: '600',
                },
              ],
            },
            liquidityMonitoringParameters: {
              targetStakeParameters: {
                timeWindow: '3600',
                scalingFactor: 10,
              },
              triggeringRatio: '0.7',
              auctionExtension: '1',
            },
            logNormal: {
              tau: 0.0001140771161,
              riskAversionParameter: 0.01,
              params: {
                mu: 0,
                r: 0.016,
                sigma: 0.5,
              },
            },
          },
        },
        closingTimestamp,
        enactmentTimestamp,
      },
    },
  };
}

// Requires cy.createMarket() to be run to set up parent market
export function createSuccessorMarketProposalTxBody(
  parentMarketId: string
): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 10000;
  const MIN_ENACT_SEC = 10000;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Test successor market proposal details',
        description: 'E2E test for successor market',
      },
      terms: {
        newMarket: {
          changes: {
            decimalPlaces: '5',
            positionDecimalPlaces: '5',
            linearSlippageFactor: '0.001',
            quadraticSlippageFactor: '0',
            liquiditySlaParameters: {
              priceRange: '0.5',
              commitmentMinTimeFraction: '0.1',
              performanceHysteresisEpochs: 2,
              slaCompetitionFactor: '0.1',
            },
            instrument: {
              name: 'Token test market',
              code: 'TEST.24h',
              future: {
                settlementAsset:
                  '816af99af60d684502a40824758f6b5377e6af48e50a9ee8ef478ecb879ea8bc',
                quoteName: 'fUSDC',
                dataSourceSpecForSettlementData: {
                  external: {
                    oracle: {
                      signers: [
                        {
                          pubKey: {
                            key: '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680',
                          },
                        },
                      ],
                      filters: [
                        {
                          key: {
                            name: 'prices.BTC.value',
                            type: 'TYPE_INTEGER' as const,
                            numberDecimalPlaces: '0',
                          },
                          conditions: [
                            {
                              operator: 'OPERATOR_GREATER_THAN' as const,
                              value: '0',
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  external: {
                    oracle: {
                      signers: [
                        {
                          pubKey: {
                            key: '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680',
                          },
                        },
                      ],
                      filters: [
                        {
                          key: {
                            name: 'trading.terminated.ETH5',
                            type: 'TYPE_BOOLEAN' as const,
                          },
                          conditions: [
                            {
                              operator: 'OPERATOR_EQUALS' as const,
                              value: 'true',
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
                dataSourceSpecBinding: {
                  settlementDataProperty: 'prices.BTC.value',
                  tradingTerminationProperty: 'trading.terminated.ETH5',
                },
              },
            },
            metadata: [
              'sector:food',
              'sector:materials',
              'source:docs.vega.xyz',
            ],
            priceMonitoringParameters: {
              triggers: [
                {
                  horizon: '43200',
                  probability: '0.9999999',
                  auctionExtension: '600',
                },
              ],
            },
            liquidityMonitoringParameters: {
              targetStakeParameters: {
                timeWindow: '3600',
                scalingFactor: 10,
              },
              triggeringRatio: '0.7',
              auctionExtension: '1',
            },
            logNormal: {
              tau: 0.0001140771161,
              riskAversionParameter: 0.01,
              params: {
                mu: 0,
                r: 0.016,
                sigma: 0.5,
              },
            },
            successor: {
              parentMarketId: parentMarketId,
              insurancePoolFraction: '0.75',
            },
          },
        },
        closingTimestamp,
        enactmentTimestamp,
      },
    },
  };
}

export function mockNetworkUpgradeProposal() {
  cy.mockGQL((req) => {
    aliasGQLQuery(req, 'Nodes', nodeData);
    aliasGQLQuery(req, 'Proposals', proposalsData);
    aliasGQLQuery(req, 'ProtocolUpgradeProposals', upgradeProposalsData);
  });
}
