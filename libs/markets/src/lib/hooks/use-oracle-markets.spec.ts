import { renderHook } from '@testing-library/react';
import type { Provider } from '../oracle-schema';
import { useOracleMarkets } from './use-oracle-markets';
const mockMarkets = jest.fn<{ data: unknown | null }, unknown[]>(() => ({
  data: marketsData,
}));

jest.mock('../__generated__/OracleMarketsSpec', () => ({
  useOracleMarketsSpecQuery: jest.fn((args) => mockMarkets()),
}));

describe('useOracleMarkets', () => {
  it('returns undefined if no market data present', () => {
    mockMarkets.mockReturnValueOnce({ data: null });
    const { result } = renderHook(() => useOracleMarkets(mockProvider));
    expect(result.current).toBeUndefined();
  });

  it('returns correct market list for the given provider', () => {
    mockMarkets.mockReturnValueOnce({ data: marketsData });
    const { result } = renderHook(() => useOracleMarkets(mockProvider));
    expect(result.current).toStrictEqual(oracleMarkets);
  });
});

const mockProvider: Provider = {
  name: 'Mock Oracle',
  url: 'https://Mock.com',
  description_markdown: 'mock oracle description',
  oracle: {
    status: 'GOOD',
    status_reason: '',
    first_verified: '2023-05-22T00:00:00.000Z',
    last_verified: '2023-05-22T00:00:00.000Z',
    type: 'eth_address',
    eth_address: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
  },
  proofs: [
    {
      format: 'url',
      available: true,
      type: 'web',
      url: 'https://web.archive.org/web/20200923175817/https://docs.pro.Mock.com/#oracle',
    },
  ],
  github_link:
    'https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/eth_address-0xaddress.toml',
};

const marketsData = {
  marketsConnection: {
    __typename: 'MarketConnection',
    edges: [
      {
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          id: '2dca7baa5f7269b08d053668bca03f97f72e9a162327eebd941c54f1f9fb8f80',
          state: 'STATE_ACTIVE',
          tradingMode: 'TRADING_MODE_CONTINUOUS',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              id: '',
              name: 'BTC/USDT expiry 2023 June 30th',
              code: 'BTC/USDT-230630',
              product: {
                __typename: 'Future',
                dataSourceSpecForSettlementData: {
                  __typename: 'DataSourceSpec',
                  id: '6eb55cdb9e3d1697d9df2eb2d97c4560da3519652fdf7e542f5801fc0919c32d',
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
                              __typename: 'ETHAddress',
                              address: '0xaddress',
                            },
                          },
                        ],
                        filters: [
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.BTC.value',
                              type: 'TYPE_INTEGER',
                              numberDecimalPlaces: 6,
                            },
                          },
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.BTC.timestamp',
                              type: 'TYPE_TIMESTAMP',
                              numberDecimalPlaces: null,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  __typename: 'DataSourceSpec',
                  id: '01d86d6182ee2e03cf02f9091734494932d39ab5ae6f23f7f5fd1fbe6668d422',
                  data: {
                    __typename: 'DataSourceDefinition',
                    sourceType: {
                      __typename: 'DataSourceDefinitionInternal',
                    },
                  },
                },
                dataSourceSpecBinding: {
                  __typename: 'DataSourceSpecToFutureBinding',
                  settlementDataProperty: 'prices.BTC.value',
                  tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
                },
              },
            },
          },
        },
      },
      {
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          id: '84025e68387cf61c2b91228d768dcdd4f10a9ee5cd2824fdea35b259976f59c1',
          state: 'STATE_ACTIVE',
          tradingMode: 'TRADING_MODE_CONTINUOUS',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              id: '',
              name: 'LINK/USDT expiry 2023 June 30th',
              code: 'LINK/USDT-230630',
              product: {
                __typename: 'Future',
                dataSourceSpecForSettlementData: {
                  __typename: 'DataSourceSpec',
                  id: 'bd709a4e6820d8714241f4c9576dffa71108179663c1f8442c991121fa1b0251',
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
                              __typename: 'ETHAddress',
                              address: '0xaddress',
                            },
                          },
                        ],
                        filters: [
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.LINK.value',
                              type: 'TYPE_INTEGER',
                              numberDecimalPlaces: 6,
                            },
                          },
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.LINK.timestamp',
                              type: 'TYPE_TIMESTAMP',
                              numberDecimalPlaces: null,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  __typename: 'DataSourceSpec',
                  id: '01d86d6182ee2e03cf02f9091734494932d39ab5ae6f23f7f5fd1fbe6668d422',
                  data: {
                    __typename: 'DataSourceDefinition',
                    sourceType: {
                      __typename: 'DataSourceDefinitionInternal',
                    },
                  },
                },
                dataSourceSpecBinding: {
                  __typename: 'DataSourceSpecToFutureBinding',
                  settlementDataProperty: 'prices.LINK.value',
                  tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
                },
              },
            },
          },
        },
      },
      {
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          id: '4507930a8c508eef6731f1342720adfa5f46096a8ef7a5848450740132ab78ab',
          state: 'STATE_ACTIVE',
          tradingMode: 'TRADING_MODE_CONTINUOUS',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              id: '',
              name: 'ETH/USDT expiry 2023 June 30th',
              code: 'ETH/USDT-230630',
              product: {
                __typename: 'Future',
                dataSourceSpecForSettlementData: {
                  __typename: 'DataSourceSpec',
                  id: '2687518113f63219a0b7594688dc78be62c86936a8ce306f50032ec70bdce493',
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
                              __typename: 'ETHAddress',
                              address: '0xaddress',
                            },
                          },
                        ],
                        filters: [
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.ETH.value',
                              type: 'TYPE_INTEGER',
                              numberDecimalPlaces: 6,
                            },
                          },
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.ETH.timestamp',
                              type: 'TYPE_TIMESTAMP',
                              numberDecimalPlaces: null,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  __typename: 'DataSourceSpec',
                  id: '01d86d6182ee2e03cf02f9091734494932d39ab5ae6f23f7f5fd1fbe6668d422',
                  data: {
                    __typename: 'DataSourceDefinition',
                    sourceType: {
                      __typename: 'DataSourceDefinitionInternal',
                    },
                  },
                },
                dataSourceSpecBinding: {
                  __typename: 'DataSourceSpecToFutureBinding',
                  settlementDataProperty: 'prices.ETH.value',
                  tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
                },
              },
            },
          },
        },
      },
      {
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          id: '074c929bba8faeeeba352b2569fc5360a59e12cdcbf60f915b492c4ac228b566',
          state: 'STATE_PROPOSED',
          tradingMode: 'TRADING_MODE_NO_TRADING',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              id: '',
              name: 'LINK/USDT expiry 2023 Sept 30th',
              code: 'LINK/USDT-230930',
              product: {
                __typename: 'Future',
                dataSourceSpecForSettlementData: {
                  __typename: 'DataSourceSpec',
                  id: 'cda7643a04cb45f62fdb06851a6fea2dc18d94931f2eab58f6918c6c13352fb6',
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
                              __typename: 'ETHAddress',
                              address: '0xaddress',
                            },
                          },
                        ],
                        filters: [
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.LINK.value',
                              type: 'TYPE_INTEGER',
                              numberDecimalPlaces: 6,
                            },
                          },
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.LINK.timestamp',
                              type: 'TYPE_TIMESTAMP',
                              numberDecimalPlaces: null,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  __typename: 'DataSourceSpec',
                  id: 'b3bf72d42d2938eceea05725949ecd24d7138a3cd7e29056a46b381efcbb4115',
                  data: {
                    __typename: 'DataSourceDefinition',
                    sourceType: {
                      __typename: 'DataSourceDefinitionInternal',
                    },
                  },
                },
                dataSourceSpecBinding: {
                  __typename: 'DataSourceSpecToFutureBinding',
                  settlementDataProperty: 'prices.LINK.value',
                  tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
                },
              },
            },
          },
        },
      },
      {
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          id: '2c2ea995d7366e423be7604f63ce047aa7186eb030ecc7b77395eae2fcbffcc5',
          state: 'STATE_PROPOSED',
          tradingMode: 'TRADING_MODE_NO_TRADING',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              id: '',
              name: 'ETH/USDT expiry 2023 Sept 30th',
              code: 'ETH/USDT-230930',
              product: {
                __typename: 'Future',
                dataSourceSpecForSettlementData: {
                  __typename: 'DataSourceSpec',
                  id: 'bb59cbdfbe167abc714954bf474354ac80b2feb798b907d6d86554fdd551f804',
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
                              __typename: 'ETHAddress',
                              address:
                                '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
                            },
                          },
                        ],
                        filters: [
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.ETH.value',
                              type: 'TYPE_INTEGER',
                              numberDecimalPlaces: 6,
                            },
                          },
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.ETH.timestamp',
                              type: 'TYPE_TIMESTAMP',
                              numberDecimalPlaces: null,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  __typename: 'DataSourceSpec',
                  id: 'b3bf72d42d2938eceea05725949ecd24d7138a3cd7e29056a46b381efcbb4115',
                  data: {
                    __typename: 'DataSourceDefinition',
                    sourceType: {
                      __typename: 'DataSourceDefinitionInternal',
                    },
                  },
                },
                dataSourceSpecBinding: {
                  __typename: 'DataSourceSpecToFutureBinding',
                  settlementDataProperty: 'prices.ETH.value',
                  tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
                },
              },
            },
          },
        },
      },
      {
        __typename: 'MarketEdge',
        node: {
          __typename: 'Market',
          id: '5b05109662e7434fea498c4a1c91d3179b80e9b8950d6106cec60e1f342fc604',
          state: 'STATE_PROPOSED',
          tradingMode: 'TRADING_MODE_NO_TRADING',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              id: '',
              name: 'BTC/USDT expiry 2023 Sept 30th',
              code: 'BTC/USDT-230930',
              product: {
                __typename: 'Future',
                dataSourceSpecForSettlementData: {
                  __typename: 'DataSourceSpec',
                  id: '99a1551b8cc7b75a3628a768e0772dde4c5a1ddf6c647507079c2e111d614a28',
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
                              __typename: 'ETHAddress',
                              address:
                                '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
                            },
                          },
                        ],
                        filters: [
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.BTC.value',
                              type: 'TYPE_INTEGER',
                              numberDecimalPlaces: 6,
                            },
                          },
                          {
                            __typename: 'Filter',
                            key: {
                              __typename: 'PropertyKey',
                              name: 'prices.BTC.timestamp',
                              type: 'TYPE_TIMESTAMP',
                              numberDecimalPlaces: null,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                dataSourceSpecForTradingTermination: {
                  __typename: 'DataSourceSpec',
                  id: 'b3bf72d42d2938eceea05725949ecd24d7138a3cd7e29056a46b381efcbb4115',
                  data: {
                    __typename: 'DataSourceDefinition',
                    sourceType: {
                      __typename: 'DataSourceDefinitionInternal',
                    },
                  },
                },
                dataSourceSpecBinding: {
                  __typename: 'DataSourceSpecToFutureBinding',
                  settlementDataProperty: 'prices.BTC.value',
                  tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
                },
              },
            },
          },
        },
      },
    ],
  },
};

const oracleMarkets = [
  {
    __typename: 'Market',
    id: '2c2ea995d7366e423be7604f63ce047aa7186eb030ecc7b77395eae2fcbffcc5',
    state: 'STATE_PROPOSED',
    tradingMode: 'TRADING_MODE_NO_TRADING',
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        id: '',
        name: 'ETH/USDT expiry 2023 Sept 30th',
        code: 'ETH/USDT-230930',
        product: {
          __typename: 'Future',
          dataSourceSpecForSettlementData: {
            __typename: 'DataSourceSpec',
            id: 'bb59cbdfbe167abc714954bf474354ac80b2feb798b907d6d86554fdd551f804',
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
                        __typename: 'ETHAddress',
                        address: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
                      },
                    },
                  ],
                  filters: [
                    {
                      __typename: 'Filter',
                      key: {
                        __typename: 'PropertyKey',
                        name: 'prices.ETH.value',
                        type: 'TYPE_INTEGER',
                        numberDecimalPlaces: 6,
                      },
                    },
                    {
                      __typename: 'Filter',
                      key: {
                        __typename: 'PropertyKey',
                        name: 'prices.ETH.timestamp',
                        type: 'TYPE_TIMESTAMP',
                        numberDecimalPlaces: null,
                      },
                    },
                  ],
                },
              },
            },
          },
          dataSourceSpecForTradingTermination: {
            __typename: 'DataSourceSpec',
            id: 'b3bf72d42d2938eceea05725949ecd24d7138a3cd7e29056a46b381efcbb4115',
            data: {
              __typename: 'DataSourceDefinition',
              sourceType: { __typename: 'DataSourceDefinitionInternal' },
            },
          },
          dataSourceSpecBinding: {
            __typename: 'DataSourceSpecToFutureBinding',
            settlementDataProperty: 'prices.ETH.value',
            tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
          },
        },
      },
    },
  },
  {
    __typename: 'Market',
    id: '5b05109662e7434fea498c4a1c91d3179b80e9b8950d6106cec60e1f342fc604',
    state: 'STATE_PROPOSED',
    tradingMode: 'TRADING_MODE_NO_TRADING',
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        id: '',
        name: 'BTC/USDT expiry 2023 Sept 30th',
        code: 'BTC/USDT-230930',
        product: {
          __typename: 'Future',
          dataSourceSpecForSettlementData: {
            __typename: 'DataSourceSpec',
            id: '99a1551b8cc7b75a3628a768e0772dde4c5a1ddf6c647507079c2e111d614a28',
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
                        __typename: 'ETHAddress',
                        address: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
                      },
                    },
                  ],
                  filters: [
                    {
                      __typename: 'Filter',
                      key: {
                        __typename: 'PropertyKey',
                        name: 'prices.BTC.value',
                        type: 'TYPE_INTEGER',
                        numberDecimalPlaces: 6,
                      },
                    },
                    {
                      __typename: 'Filter',
                      key: {
                        __typename: 'PropertyKey',
                        name: 'prices.BTC.timestamp',
                        type: 'TYPE_TIMESTAMP',
                        numberDecimalPlaces: null,
                      },
                    },
                  ],
                },
              },
            },
          },
          dataSourceSpecForTradingTermination: {
            __typename: 'DataSourceSpec',
            id: 'b3bf72d42d2938eceea05725949ecd24d7138a3cd7e29056a46b381efcbb4115',
            data: {
              __typename: 'DataSourceDefinition',
              sourceType: { __typename: 'DataSourceDefinitionInternal' },
            },
          },
          dataSourceSpecBinding: {
            __typename: 'DataSourceSpecToFutureBinding',
            settlementDataProperty: 'prices.BTC.value',
            tradingTerminationProperty: 'vegaprotocol.builtin.timestamp',
          },
        },
      },
    },
  },
];
