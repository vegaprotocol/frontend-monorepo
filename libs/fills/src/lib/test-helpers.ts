import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import * as Schema from '@vegaprotocol/types';
import type { Trade } from './fills-data-provider';

export const generateFill = (override?: PartialDeep<Trade>) => {
  const defaultFill: Trade = {
    __typename: 'Trade',
    id: '0',
    createdAt: '2005-04-02T19:37:00.000Z',
    price: '10000000',
    size: '50000',
    buyOrder: 'buy-order',
    sellOrder: 'sell-order',
    aggressor: Schema.Side.SIDE_BUY,
    buyer: {
      __typename: 'Party',
      id: 'buyer-id',
    },
    seller: {
      __typename: 'Party',
      id: 'seller-id',
    },
    buyerFee: {
      __typename: 'TradeFee',
      makerFee: '100',
      infrastructureFee: '100',
      liquidityFee: '100',
      buyBackFee: '0',
      treasuryFee: '0',
      highVolumeMakerFee: '0',
      liquidityFeeReferralDiscount: '1',
      liquidityFeeVolumeDiscount: '2',
      makerFeeReferralDiscount: '3',
      makerFeeVolumeDiscount: '4',
      infrastructureFeeReferralDiscount: '5',
      infrastructureFeeVolumeDiscount: '6',
    },
    sellerFee: {
      __typename: 'TradeFee',
      makerFee: '200',
      infrastructureFee: '200',
      liquidityFee: '200',
      buyBackFee: '0',
      treasuryFee: '0',
      highVolumeMakerFee: '0',
      liquidityFeeReferralDiscount: '2',
      liquidityFeeVolumeDiscount: '3',
      makerFeeReferralDiscount: '4',
      makerFeeVolumeDiscount: '5',
      infrastructureFeeReferralDiscount: '6',
      infrastructureFeeVolumeDiscount: '7',
    },
    market: {
      __typename: 'Market',
      id: 'market-id',
      positionDecimalPlaces: 0,
      decimalPlaces: 5,
      tickSize: '1',
      markPriceConfiguration: {
        decayWeight: '',
        decayPower: 0,
        cashAmount: '',
        SourceStalenessTolerance: [],
        CompositePriceType:
          Schema.CompositePriceType.COMPOSITE_PRICE_TYPE_LAST_TRADE,
      },
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          infrastructureFee: '0.1',
          liquidityFee: '0.1',
          makerFee: '0.1',
          buyBackFee: '0',
          treasuryFee: '0',
        },
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
              status: Schema.AssetStatus.STATUS_ENABLED,
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

  return merge(defaultFill, override);
};
