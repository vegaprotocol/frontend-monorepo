import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  MarketFieldsFragment,
  MarketsQuery,
} from './__generated__/markets';
import type {
  ParentMarketIdQuery,
  SuccessorMarketIdQuery,
  SuccessorMarketIdsQuery,
  SuccessorMarketQuery,
} from './__generated__';

export const marketsQuery = (
  override?: PartialDeep<MarketsQuery>
): MarketsQuery => {
  const defaultResult: MarketsQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: marketFieldsFragments.map((node) => ({
        __typename: 'MarketEdge',
        node,
      })),
    },
  };

  return merge(defaultResult, override);
};

export const createMarketFragment = (
  override?: PartialDeep<MarketFieldsFragment>
): MarketFieldsFragment => {
  const defaultFragment: MarketFieldsFragment = {
    id: 'market-0',
    decimalPlaces: 5,
    positionDecimalPlaces: 0,
    tickSize: '1',
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      proposed: '2022-08-23T11:36:32.252490405Z',
      pending: '2022-08-24T11:36:32.252490405Z',
      open: null,
      close: null,
    },
    successorMarketID: null,
    parentMarketID: null,
    fees: {
      __typename: 'Fees',
      factors: {
        __typename: 'FeeFactors',
        makerFee: '',
        infrastructureFee: '',
        liquidityFee: '',
      },
      liquidityFeeSettings: {
        __typename: 'LiquidityFeeSettings',
        method: Schema.LiquidityFeeMethod.METHOD_MARGINAL_COST,
        feeConstant: '',
      },
    },
    tradableInstrument: {
      instrument: {
        id: '',
        code: 'BTCUSD.MF21',
        name: 'ACTIVE MARKET',
        metadata: {
          __typename: 'InstrumentMetadata',
          tags: [],
        },
        product: {
          __typename: 'Future',
          settlementAsset: {
            id: 'asset-0',
            symbol: 'tDAI',
            name: 'tDAI',
            decimals: 5,
            quantum: '1',
            __typename: 'Asset',
            source: {
              contractAddress: '0x0158031158Bb4dF2AD02eAA31e8963E84EA978a4',
              lifetimeLimit: '123000000',
              withdrawThreshold: '50',
              chainId: '1',
              __typename: 'ERC20',
            },
            status: Schema.AssetStatus.STATUS_ENABLED,
            networkTreasuryAccount: {
              balance: '1',
              __typename: 'AccountBalance',
            },
            globalInsuranceAccount: {
              balance: '2',
              __typename: 'AccountBalance',
            },
          },
          dataSourceSpecForTradingTermination: {
            __typename: 'DataSourceSpec',
            id: '871f467e06f91029df8fba3edc0a0aad0259445f2bb144cb79a4113fe5be95bf',
            data: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionExternal',
                sourceType: {
                  __typename: 'DataSourceSpecConfiguration',
                  signers: [
                    {
                      __typename: 'Signer',
                      signer: {
                        __typename: 'PubKey',
                        key: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
                      },
                    },
                  ],
                  filters: [
                    {
                      __typename: 'Filter',
                      conditions: [],
                      key: {
                        __typename: 'PropertyKey',
                        name: 'settlement-data-property',
                        type: Schema.PropertyKeyType.TYPE_TIMESTAMP,
                        numberDecimalPlaces: null,
                      },
                    },
                  ],
                },
              },
            },
          },
          dataSourceSpecForSettlementData: {
            __typename: 'DataSourceSpec',
            id: 'f028fe5ea7de3890962a05a7163fdde562629af649ed81b8c8902fafb6eef04f',
            data: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionExternal',
                sourceType: {
                  __typename: 'DataSourceSpecConfiguration',
                  signers: [
                    {
                      __typename: 'Signer',
                      signer: {
                        __typename: 'PubKey',
                        key: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
                      },
                    },
                  ],
                  filters: [
                    {
                      __typename: 'Filter',
                      conditions: [],
                      key: {
                        __typename: 'PropertyKey',
                        name: 'settlement-data-property',
                        type: Schema.PropertyKeyType.TYPE_INTEGER,
                        numberDecimalPlaces: 2,
                      },
                    },
                  ],
                },
              },
            },
          },
          dataSourceSpecBinding: {
            __typename: 'DataSourceSpecToFutureBinding',
            tradingTerminationProperty: 'trading-termination-property',
            settlementDataProperty: 'settlement-data-property',
          },
          quoteName: 'DAI',
        },
        __typename: 'Instrument',
      },
      __typename: 'TradableInstrument',
    },
    __typename: 'Market',
    markPriceConfiguration: {
      decayWeight: '',
      decayPower: 0,
      cashAmount: '',
      SourceStalenessTolerance: [],
      CompositePriceType:
        Schema.CompositePriceType.COMPOSITE_PRICE_TYPE_LAST_TRADE,
    },
  };

  return merge(cloneDeep(defaultFragment), override);
};

const marketFieldsFragments: MarketFieldsFragment[] = [
  createMarketFragment({ id: 'market-0' }),
  createMarketFragment({
    id: 'market-1',
    decimalPlaces: 2,
    tradableInstrument: {
      instrument: {
        name: 'SUSPENDED MARKET',
        code: 'SOLUSD',
        product: {
          __typename: 'Future',
          settlementAsset: {
            id: 'asset-1',
            symbol: 'XYZalpha',
            name: 'XYZalpha',
            decimals: 5,
            __typename: 'Asset',
          },
        },
      },
    },
  }),
  createMarketFragment({
    id: 'market-2',
    marketTimestamps: {
      proposed: '2022-08-23T11:36:32.252490405Z',
      pending: '2022-08-24T11:36:32.252490405Z',
      open: '2022-08-25T11:36:32.252490405Z',
      close: '2022-08-26T11:36:32.252490405Z',
    },
    fees: {
      factors: {
        makerFee: '0.0002',
        infrastructureFee: '0.0005',
        liquidityFee: '0.001',
      },
    },
    tradableInstrument: {
      instrument: {
        code: 'AAPL.MF21',
        name: 'Apple Monthly (30 Jun 2022)',
        product: {
          __typename: 'Future',
          settlementAsset: {
            id: 'asset-id',
            name: '',
            symbol: 'tUSDC',
            decimals: 5,
            __typename: 'Asset',
          },
          quoteName: 'USDC',
        },
      },
    },
  }),
  createMarketFragment({
    id: 'market-3',
    marketTimestamps: {
      proposed: '2022-08-23T11:36:32.252490405Z',
      pending: '2022-08-24T11:36:32.252490405Z',
      open: '2022-08-25T11:36:32.252490405Z',
      close: '2022-08-26T11:36:32.252490405Z',
    },
    fees: {
      factors: {
        makerFee: '0.0002',
        infrastructureFee: '0.0005',
        liquidityFee: '0.001',
      },
    },
    tradableInstrument: {
      instrument: {
        code: 'ETHBTC.QM21',
        name: 'ETHBTC Quarterly (30 Jun 2022)',
        product: {
          __typename: 'Future',
          settlementAsset: {
            id: 'asset-3',
            symbol: 'tBTC',
            name: '',
            decimals: 5,
            __typename: 'Asset',
          },
          quoteName: 'BTC',
        },
      },
    },
  }),
];

export const successorMarketIdQuery = (
  override?: Partial<SuccessorMarketIdQuery>
) => {
  const res: SuccessorMarketIdQuery = {
    __typename: 'Query',
    market: {
      __typename: 'Market',
      successorMarketID: 'SUCCESSOR-A',
    },
  };
  return merge(res, override);
};

export const parentMarketIdQuery = (
  override?: Partial<ParentMarketIdQuery>
) => {
  const res: ParentMarketIdQuery = {
    __typename: 'Query',
    market: {
      __typename: 'Market',
      parentMarketID: 'PARENT-A',
    },
  };
  return merge(res, override);
};

export const successorMarketIdsQuery = (
  override?: Partial<SuccessorMarketIdsQuery>
) => {
  const res: SuccessorMarketIdsQuery = {
    __typename: 'Query',
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: [
        {
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            id: 'PARENT-A',
            successorMarketID: 'SUCCESSOR-A',
          },
        },
      ],
    },
  };
  return merge(res, override);
};

export const successorMarketQuery = (
  override?: Partial<SuccessorMarketQuery>
) => {
  const res: SuccessorMarketQuery = {
    __typename: 'Query',
    market: {
      __typename: 'Market',
      id: 'SUCCESSOR-A',
      positionDecimalPlaces: 2,
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          code: 'SUCCESSOR-A',
          name: 'Successor Market A',
        },
      },
      tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    },
  };

  return merge(res, override);
};
