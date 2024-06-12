import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { FundingPayment } from './funding-payments-data-provider';
import { AssetStatus, CompositePriceType } from '@vegaprotocol/types';

export const generateFundingPayment = (
  override?: PartialDeep<FundingPayment>
) => {
  const defaultFundingPayment: FundingPayment = {
    marketId:
      '69abf5c456c20f4d189cea79a11dfd6b0958ead58ab34bd66f73eea48aee600c',
    partyId: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
    fundingPeriodSeq: 84,
    amount: '126973',
    timestamp: '2023-10-06T07:06:43.020994Z',
    market: {
      __typename: 'Market',
      id: 'market-id',
      positionDecimalPlaces: 0,
      decimalPlaces: 5,
      tickSize: '1',
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          infrastructureFee: '0.1',
          liquidityFee: '0.1',
          makerFee: '0.1',
        },
      },
      markPriceConfiguration: {
        decayWeight: '',
        decayPower: 0,
        cashAmount: '',
        SourceStalenessTolerance: [],
        CompositePriceType: CompositePriceType.COMPOSITE_PRICE_TYPE_LAST_TRADE,
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        proposed: '2005-03-31T19:37:00.000Z',
        pending: '2005-04-01T19:37:00.000Z',
        open: '2005-04-02T19:37:00.000Z',
        close: '2005-04-02T19:37:00.000Z',
      },
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: 'instrument-id',
          code: 'instrument-code',
          name: 'UNIDAI Monthly (30 Jun 2022)',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: ['tag-a'],
          },
          product: {
            __typename: 'Future',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-id',
              name: 'asset-id',
              symbol: 'SYM',
              decimals: 18,
              quantum: '1',
              status: AssetStatus.STATUS_ENABLED,
              source: {
                __typename: 'ERC20' as const,
                chainId: '1',
                contractAddress: '0x123',
                withdrawThreshold: '1',
                lifetimeLimit: '1',
              },
            },
            quoteName: '',
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: 'oracleId',
              data: {
                __typename: 'DataSourceDefinition',
                sourceType: {
                  __typename: 'DataSourceDefinitionExternal',
                  sourceType: {
                    __typename: 'DataSourceSpecConfiguration',
                  },
                },
              },
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: 'oracleId',
              data: {
                __typename: 'DataSourceDefinition',
                sourceType: {
                  __typename: 'DataSourceDefinitionExternal',
                  sourceType: {
                    __typename: 'DataSourceSpecConfiguration',
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              tradingTerminationProperty: 'trading-termination-property',
              settlementDataProperty: 'settlement-data-property',
            },
          },
        },
      },
    },
  };

  return merge(defaultFundingPayment, override);
};
