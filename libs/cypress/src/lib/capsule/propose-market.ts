import * as Schema from '@vegaprotocol/types';
import { addSeconds, millisecondsToSeconds } from 'date-fns';
import { gql } from 'graphql-request';
import { encodeTransaction } from '../utils';
import { request, requestGQL } from './request';
import { createLog } from './logging';

const log = createLog('propose-market');

const MIN_CLOSE_SEC = 3;
const MIN_ENACT_SEC = 3;

export async function proposeMarket(publicKey: string, token: string) {
  log('sending proposal tx');
  const proposalTx = createNewMarketProposal();
  const result = await request('client.send_transaction', {
    token,
    publicKey,
    sendingMode: 'TYPE_SYNC',
    encodedTransaction: encodeTransaction(proposalTx),
  });

  return result.result;
}

function createNewMarketProposal() {
  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Add Lorem Ipsum market',
        description: 'An example proposal to add Lorem Ipsum market',
      },
      terms: {
        newMarket: {
          changes: {
            decimalPlaces: '5',
            positionDecimalPlaces: '5',
            lpPriceRange: '10',
            instrument: {
              name: 'Test market 1',
              code: 'TEST.24h',
              future: {
                settlementAsset: 'fUSDC',
                quoteName: 'fUSDC',
                dataSourceSpecForSettlementData: {
                  external: {
                    oracle: {
                      signers: [
                        {
                          pubKey: {
                            key: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
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
              triggeringRatio: 0.7,
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

export function waitForProposal(id: string): Promise<{ id: string }> {
  const query = gql`
    {
      proposal(id: "${id}") {
        id
        state
      }
    }
  `;
  return new Promise((resolve, reject) => {
    let tick = 0;
    const interval = setInterval(async () => {
      if (tick >= 4) {
        clearInterval(interval);
        reject(new Error('proposal never seen'));
      }

      try {
        const res = await requestGQL<{
          proposal: {
            id: string;
            state: string;
          };
        }>(query);

        if (
          res.proposal !== null &&
          res.proposal.state === Schema.ProposalState.STATE_OPEN
        ) {
          clearInterval(interval);
          resolve(res.proposal);
        }
      } catch (err) {
        console.log(err);
      }

      tick++;
    }, 1000);
  });
}

export function waitForEnactment() {
  const timeout = MIN_CLOSE_SEC * 1000 + MIN_ENACT_SEC * 1000;
  return new Promise((resolve) => {
    setTimeout(resolve, timeout + 2000);
  });
}
