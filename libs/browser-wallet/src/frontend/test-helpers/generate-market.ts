import type { vegaMarket } from '@vegaprotocol/rest-clients/dist/trading-data';
import {
  ConditionOperator,
  MarketTradingMode,
  v1PropertyKeyType,
  vegaDataSourceSpecStatus,
  vegaMarketState,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export function generateMarket(override?: PartialDeep<vegaMarket>): vegaMarket {
  const defaultMarket: vegaMarket = {
    id: '4c90031caf280b02f3e5441819e315806dc5c445cc36b0fe00cd42cf7c73b462',
    tradableInstrument: {
      instrument: {
        id: '',
        code: 'ETH/USD TEST',
        name: 'ETH USD TEST',
        metadata: {
          tags: [
            'base:ETH',
            'quote:USD',
            'class:fx/crypto',
            'monthly',
            'sector:defisettlement-expiry-date:2023-02-06T10:00:00.000Z',
          ],
        },
        future: {
          settlementAsset:
            '84fff099818dc4f5319477f0812b4341565cfb32ccf735beede734e386b8108f',
          quoteName: 'USD',
          dataSourceSpecForSettlementData: {
            id: '9a36559553fb2510893d83be934047f3980a24f98aee388ce7b1d31a409bf6ca',
            createdAt: '0',
            updatedAt: '0',
            data: {
              external: {
                oracle: {
                  signers: [
                    {
                      pubKey: {
                        key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                      },
                    },
                  ],
                  filters: [
                    {
                      key: {
                        name: 'prices.ETH.value',
                        type: v1PropertyKeyType.TYPE_INTEGER,
                        numberDecimalPlaces: '5',
                      },
                      conditions: [
                        {
                          operator: ConditionOperator.OPERATOR_GREATER_THAN,
                          value: '0',
                        },
                      ],
                    },
                  ],
                },
              },
            },
            status: vegaDataSourceSpecStatus.STATUS_UNSPECIFIED,
          },
          dataSourceSpecForTradingTermination: {
            id: '7fa23716a4458d64f71a40a73399604bb636c5b1dfde169e434162e9bfa681f6',
            createdAt: '0',
            updatedAt: '0',
            data: {
              external: {
                oracle: {
                  signers: [
                    {
                      pubKey: {
                        key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                      },
                    },
                  ],
                  filters: [
                    {
                      key: {
                        name: 'trading.terminated.ETH',
                        type: v1PropertyKeyType.TYPE_BOOLEAN,
                      },
                      conditions: [
                        {
                          operator: ConditionOperator.OPERATOR_EQUALS,
                          value: 'true',
                        },
                      ],
                    },
                  ],
                },
              },
            },
            status: vegaDataSourceSpecStatus.STATUS_UNSPECIFIED,
          },
          dataSourceSpecBinding: {
            settlementDataProperty: 'prices.ETH.value',
            tradingTerminationProperty: 'trading.terminated.ETH',
          },
        },
      },
      marginCalculator: {
        scalingFactors: {
          searchLevel: 1.1,
          initialMargin: 1.5,
          collateralRelease: 1.7,
        },
      },
      logNormalRiskModel: {
        riskAversionParameter: 0.001,
        tau: 0.000_001_901_285_269,
        params: {
          mu: 0,
          r: 0,
          sigma: 1.5,
        },
      },
    },
    decimalPlaces: '2',
    fees: {
      factors: {
        makerFee: '0.0002',
        infrastructureFee: '0.0005',
        liquidityFee: '0',
      },
    },
    openingAuction: {
      duration: '60',
      volume: '0',
    },
    priceMonitoringSettings: {
      parameters: {
        triggers: [
          {
            horizon: '43200',
            probability: '0.9999999',
            auctionExtension: '300',
          },
        ],
      },
    },
    liquidityMonitoringParameters: {
      targetStakeParameters: {
        timeWindow: '3600',
        scalingFactor: 0.5,
      },
      triggeringRatio: '0.3',
      auctionExtension: '1',
    },
    tradingMode: MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    state: vegaMarketState.STATE_PENDING,
    marketTimestamps: {
      proposed: '1683309952620203148',
      pending: '1683309952620203148',
      open: '1683309952620203208',
      close: '0',
    },
    positionDecimalPlaces: '2',
    lpPriceRange: '0.05',
    linearSlippageFactor: '0.1',
    quadraticSlippageFactor: '0.1',
  };
  return merge(defaultMarket, override);
}
