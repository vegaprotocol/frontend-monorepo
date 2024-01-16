import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import * as Schema from '@vegaprotocol/types';
import type { FundingPayment } from './funding-payments-data-provider';

const { MarketState, MarketTradingMode } = Schema;

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
      state: MarketState.STATE_ACTIVE,
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,

      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          infrastructureFee: '0.1',
          liquidityFee: '0.1',
          makerFee: '0.1',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
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
