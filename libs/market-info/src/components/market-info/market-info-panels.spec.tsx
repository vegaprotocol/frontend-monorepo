import { render, screen } from '@testing-library/react';
import {
  ConditionOperator,
  ConditionOperatorMapping,
} from '@vegaprotocol/types';
import { DataSourceProof } from './market-info-panels';

jest.mock('@vegaprotocol/oracles', () => ({
  useOracleMarkets: () => [
    {
      __typename: 'Market',
      id: '3ab4fc0ea7e6eabe74133fb14ef2d8934ff21dd894ff080a09ec9a3647ceb2a4',
      state: 'STATE_ACTIVE',
      tradingMode: 'TRADING_MODE_CONTINUOUS',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'BTCUSD Monthly (May 2023)',
          code: 'BTCUSD.MF21',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: 'dafc82b51cb4a3983d1ee2bb35292806bfda9044f85d2cd620aa9c1229b55326',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: 'ebf6ea8a609ff09f75995327006a491b306c567d6c831f654243d3c125405467',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.BTC.value',
              tradingTerminationProperty: 'termination.BTC.value',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '10c7d40afd910eeac0c2cad186d79cb194090d5d5f13bd31e14c49fd1bded7e2',
      state: 'STATE_SUSPENDED',
      tradingMode: 'TRADING_MODE_MONITORING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'UNIDAI Monthly (Feb 2023)',
          code: 'UNIDAI.MF21',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: 'a252d1f65201b4af162192e663b50e917328f816868f08bb9a00649571709db4',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '9505dd835aeaaeee743b66ca05da43d06f03b37edb9aae28ea2adc3d58719078',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.UNI.value',
              tradingTerminationProperty: 'termination.UNI.value',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '0f2f8d077a53835ca802808d1eaae090de06328e5a0fb21e55de2f8ea8faa389',
      state: 'STATE_ACTIVE',
      tradingMode: 'TRADING_MODE_CONTINUOUS',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'Tesla Quarterly (Jul 2023)',
          code: 'TSLA.QM21',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '05ca5485678aa7c705aa6a683fd062714cbcfdac2d1a27641cd27b66168d9c1d',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '3f5941ba047dabb3bec23f112db0a8cc8aecbbbc6b34d1366d9383ed1b0f39df',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.TSLA.value',
              tradingTerminationProperty: 'termination.TSLA.value',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '5ddb6f1570c0ef7aea41ebfef234dbded4ce2c11722cf033954459c45c30c057',
      state: 'STATE_ACTIVE',
      tradingMode: 'TRADING_MODE_CONTINUOUS',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'AAVEDAI Monthly (May 2023)',
          code: 'AAVEDAI.MF21',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '307e8ef9bf292ee4f0ebf8f0b90e4b233a618b0dfe1ea3d805aa2e264a7c6704',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '457847a3c3bb5cc2e00dfb07250a5214adedfb3f10ad9e8bca91eb59d02b7ce7',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.AAVE.value',
              tradingTerminationProperty: 'termination.AAVE.value',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: 'f308a23f5f5e2623b35846f4e7d26820c6f554802c8b73963b1977385c6f7184',
      state: 'STATE_ACTIVE',
      tradingMode: 'TRADING_MODE_CONTINUOUS',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'Apple Monthly (May 2023)',
          code: 'AAPL.MF21',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '44d9b71333c420b15357dc80f8534dca7e9fe18a8d6fe913d17be282b96c02bc',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '8c68325d12d62b8ddd16105752410c5abf8626a3b76c3fe6e63004accbe7339a',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.AAPL.value',
              tradingTerminationProperty: 'termination.AAPL.value',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '4cb06ca74c44c2c4aea5018ca9106bd771ee0f8904fa4127bcab637bd17801a1',
      state: 'STATE_ACTIVE',
      tradingMode: 'TRADING_MODE_CONTINUOUS',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'ETHDAI Monthly (May 2023)',
          code: 'ETHDAI.MF21',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '624f4399f70126da539f1709bac32aac9323e6c33493431d025f13426dce0be3',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '676c954200059dfe1f63c9b0df67112b9719e18033bdcbada7c679e97b7c753d',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH.value',
              tradingTerminationProperty: 'termination.ETH.value',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: 'e6561f69c2a76858866aab2896eeb529b46040614566e0665602d67bc682c31f',
      state: 'STATE_ACTIVE',
      tradingMode: 'TRADING_MODE_CONTINUOUS',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'ETHBTC Quarterly (Jul 2023)',
          code: 'ETHBTC.QM21',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '624f4399f70126da539f1709bac32aac9323e6c33493431d025f13426dce0be3',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '676c954200059dfe1f63c9b0df67112b9719e18033bdcbada7c679e97b7c753d',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH.value',
              tradingTerminationProperty: 'termination.ETH.value',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '3aa2a828687cc3d59e92445d294891cbbd40e2165bbfb15674158ef5d4e8848d',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'SHIB USDC Crossgems',
          code: 'SHIB/USD',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '059b018bfb10b8736c0fb02ef9ea4948d632994818b644baef2d6530ac6dda49',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: 'ed66587f60cbc8549be132c3c4fcef367f0a7f8572935a17625c8902ce57c515',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.SHIB.value',
              tradingTerminationProperty: 'trading.terminated.SHIB',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '4c90031caf280b02f3e5441819e315806dc5c445cc36b0fe00cd42cf7c73b462',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'ETH USD TEST',
          code: 'ETH/USD TEST',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '9a36559553fb2510893d83be934047f3980a24f98aee388ce7b1d31a409bf6ca',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '7fa23716a4458d64f71a40a73399604bb636c5b1dfde169e434162e9bfa681f6',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH.value',
              tradingTerminationProperty: 'trading.terminated.ETH',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '21e8697a6b55862c2b7f74e5bad1408e52a02ac763c0d61f01ac523e3a05a51c',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'BTC USDT Faucet',
          code: 'BTC/USDT',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '3d790aec9b13e18b565cfb6e803d342d6abc83eabc37c75ffc74ca5ff2db124b',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '07baec32f7832f0a340b2e5b615fc84748122e4ca2d3cb94ae0dc9df7c8c10c0',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.BTC3.value',
              tradingTerminationProperty: 'trading.terminated.BTC3',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '2711ee6fff22de4fe4222951022ed3a53b2564e2a5b7aaa2ad9144cd6a65506f',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'ETH USDT Faucet',
          code: 'ETH/USDT',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: 'fe11ca8d5e40cbe0553db022381802722cead546a2ab2d60afe60118dcfd1e49',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '1e696e5b910e5d5d72b72059dc451bc9fdd8d57ecbbb055c1b425f4560e05e9e',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH3.value',
              tradingTerminationProperty: 'trading.terminated.ETH3',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '0fa9e498b4e8df8d74fb0109646d03bb6e9051809b6f916003ae28e6b58074e7',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'E USD2',
          code: 'E/USD2',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '9a36559553fb2510893d83be934047f3980a24f98aee388ce7b1d31a409bf6ca',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: 'd9334fac4aa18b8d320d2ce2838918670c84243efda95b406523152b733a4bba',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH.value',
              tradingTerminationProperty: 'trading.terminated.ETHUSD2',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '0f4d06abbf87b989f613bf3a651842b88874d70c4b8b3161c7257837447c34f9',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'ETH XUSDT - SIM II',
          code: 'ETH/USD',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '9a36559553fb2510893d83be934047f3980a24f98aee388ce7b1d31a409bf6ca',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: 'd9334fac4aa18b8d320d2ce2838918670c84243efda95b406523152b733a4bba',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH.value',
              tradingTerminationProperty: 'trading.terminated.ETHUSD2',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '4036c5bdb5b7a2dd7dfd6d9826d910254b17bf05f46ac757c10a6016de6c1ca3',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'ETH USDC',
          code: 'ETH/USDC',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '9a36559553fb2510893d83be934047f3980a24f98aee388ce7b1d31a409bf6ca',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '7fa23716a4458d64f71a40a73399604bb636c5b1dfde169e434162e9bfa681f6',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH.value',
              tradingTerminationProperty: 'trading.terminated.ETH',
            },
          },
        },
      },
    },
    {
      __typename: 'Market',
      id: '881c520ec47dd1cb49217bc569c2f4c8c0ecf10c8392141e6eab78bccb4c7c7b',
      state: 'STATE_PENDING',
      tradingMode: 'TRADING_MODE_OPENING_AUCTION',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'E USD1',
          code: 'E/USD1',
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: '9a36559553fb2510893d83be934047f3980a24f98aee388ce7b1d31a409bf6ca',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '1b6d886fd499da6bd935375f0074e6628157795f5be0e6ac9c5462bf2b6a9f54',
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
                          key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                        },
                      },
                    ],
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.ETH.value',
              tradingTerminationProperty: 'trading.terminated.ETHUSD1',
            },
          },
        },
      },
    },
  ],
}));

describe('DataSourceProof', () => {
  const ORACLE_PUBKEY =
    '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f';
  it('renders correct proof for external data sources', () => {
    const props = {
      data: {
        sourceType: {
          __typename: 'DataSourceDefinitionExternal' as const,
          sourceType: {
            __typename: 'DataSourceSpecConfiguration' as const,
            signers: [
              {
                __typename: 'Signer' as const,
                signer: {
                  __typename: 'PubKey' as const,
                  key: ORACLE_PUBKEY,
                },
              },
            ],
          },
        },
      },
      providers: [
        {
          name: 'Another oracle',
          url: 'https://zombo.com',
          description_markdown:
            'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
          oracle: {
            status: 'GOOD' as const,
            status_reason: '',
            first_verified: '2022-01-01T00:00:00.000Z',
            last_verified: '2022-12-31T00:00:00.000Z',
            type: 'public_key' as const,
            public_key: ORACLE_PUBKEY,
          },
          proofs: [
            {
              format: 'signed_message' as const,
              available: true,
              type: 'public_key' as const,
              public_key: ORACLE_PUBKEY,
              message: 'SOMEHEX',
            },
          ],
          github_link: `https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/PubKey-${ORACLE_PUBKEY}.toml`,
        },
      ],
      type: 'termination' as const,
    };
    render(<DataSourceProof id={'data-source-spec-id'} {...props} />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      props.providers[0].github_link
    );
  });

  it('renders message if there are no providers', () => {
    const props = {
      data: {
        sourceType: {
          __typename: 'DataSourceDefinitionExternal' as const,
          sourceType: {
            __typename: 'DataSourceSpecConfiguration' as const,
            signers: [
              {
                __typename: 'Signer' as const,
                signer: {
                  __typename: 'PubKey' as const,
                  key: ORACLE_PUBKEY,
                },
              },
            ],
          },
        },
      },
      providers: [],
      type: 'termination' as const,
    };
    render(<DataSourceProof id={''} {...props} />);
    expect(
      screen.getByText('No oracle proof for termination')
    ).toBeInTheDocument();
  });

  it('renders message if there are no matching proofs', () => {
    const props = {
      data: {
        sourceType: {
          __typename: 'DataSourceDefinitionExternal' as const,
          sourceType: {
            __typename: 'DataSourceSpecConfiguration' as const,
            signers: [
              {
                __typename: 'Signer' as const,
                signer: {
                  __typename: 'PubKey' as const,
                  key: ORACLE_PUBKEY,
                },
              },
            ],
          },
        },
      },
      providers: [
        {
          name: 'Another oracle',
          url: 'https://zombo.com',
          description_markdown:
            'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
          oracle: {
            status: 'GOOD' as const,
            status_reason: '',
            first_verified: '2022-01-01T00:00:00.000Z',
            last_verified: '2022-12-31T00:00:00.000Z',
            type: 'public_key' as const,
            public_key: 'not-the-pubkey',
          },
          proofs: [
            {
              format: 'signed_message' as const,
              available: true,
              type: 'public_key' as const,
              public_key: 'not-the-pubkey',
              message: 'SOMEHEX',
            },
          ],
          github_link: `https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/PubKey-${ORACLE_PUBKEY}.toml`,
        },
      ],
      type: 'settlementData' as const,
    };
    render(<DataSourceProof id={''} {...props} />);
    expect(
      screen.getByText('No oracle proof for settlement data')
    ).toBeInTheDocument();
  });

  it('renders message if no data source on market', () => {
    const props = {
      data: {
        sourceType: {
          __typename: 'Invalid',
        },
      },
      providers: [],
      type: 'termination' as const,
    };
    // @ts-ignore types are invalid
    render(<DataSourceProof {...props} />);
    expect(screen.getByText('Invalid data source')).toBeInTheDocument();
  });

  it('renders conditions for internal data sources', () => {
    const condition = {
      __typename: 'Condition' as const,
      operator: ConditionOperator.OPERATOR_GREATER_THAN,
      value: '100',
    };
    const props = {
      data: {
        sourceType: {
          __typename: 'DataSourceDefinitionInternal' as const,
          sourceType: {
            __typename: 'DataSourceSpecConfigurationTime' as const,
            conditions: [condition],
          },
        },
      },
      providers: [],
      type: 'termination' as const,
    };
    render(<DataSourceProof id={''} {...props} />);
    expect(screen.getByText('Internal conditions')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${ConditionOperatorMapping[condition.operator]} ${condition.value}`
      )
    ).toBeInTheDocument();
  });
});
