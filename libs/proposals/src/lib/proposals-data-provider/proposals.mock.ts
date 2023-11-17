import type {
  ProposalListFieldsFragment,
  ProposalsListQuery,
} from './__generated__/Proposals';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
import type { SuccessorMarketProposalDetailsQuery } from '../proposals-hooks';

export const proposalListQuery = (
  override?: PartialDeep<ProposalsListQuery>
): ProposalsListQuery => {
  const defaultResult: ProposalsListQuery = {
    proposalsConnection: {
      __typename: 'ProposalsConnection',
      edges: proposalListFields.map((node) => ({
        __typename: 'ProposalEdge',
        node,
      })),
    },
  };
  return merge(defaultResult, override);
};

export const marketUpdateProposal: ProposalListFieldsFragment = {
  id: '123',
  reference: '123',
  state: Schema.ProposalState.STATE_OPEN,
  datetime: '2022-01-01T00:00:00.000000Z',
  votes: {
    __typename: 'ProposalVotes',
    yes: {
      __typename: 'ProposalVoteSide',
      totalTokens: '10',
      totalNumber: '1',
      totalWeight: '1',
    },
    no: {
      __typename: 'ProposalVoteSide',
      totalTokens: '10',
      totalNumber: '1',
      totalWeight: '1',
    },
  },
  requiredMajority: '',
  party: {
    __typename: 'Party',
    id: '',
  },
  rationale: {
    __typename: 'ProposalRationale',
    description: '',
    title: '',
  },
  requiredParticipation: '',
  errorDetails: '',
  rejectionReason: null,
  requiredLpMajority: '',
  requiredLpParticipation: '',
  terms: {
    __typename: 'ProposalTerms',
    closingDatetime: '',
    change: {
      __typename: 'UpdateMarket',
      marketId: 'market-0',
      updateMarketConfiguration: {
        instrument: {
          code: '',
          product: {
            __typename: 'UpdateFutureProduct',
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
          },
        },
        priceMonitoringParameters: {
          triggers: [],
        },
        liquidityMonitoringParameters: {
          triggeringRatio: '0',
          targetStakeParameters: {
            scalingFactor: 0,
            timeWindow: 0,
          },
        },
        riskParameters: {
          __typename: 'UpdateMarketLogNormalRiskModel',
        },
      },
    },
  },
};

export const createProposalListFieldsFragment = (
  override?: PartialDeep<ProposalListFieldsFragment>
): ProposalListFieldsFragment => {
  const newMarket = {
    decimalPlaces: 1,
    lpPriceRange: '',
    riskParameters: {
      __typename: 'SimpleRiskModel',
      params: {
        __typename: 'SimpleRiskModelParams',
        factorLong: 0,
        factorShort: 1,
      },
    },
    metadata: undefined,
    successorConfiguration: {
      __typename: 'SuccessorConfiguration',
      parentMarketId: 'xyz',
    },
    instrument: {
      code: 'ETHUSD',
      name: 'ETHUSD',
      product: {
        settlementAsset: {
          id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
          name: 'tDAI TEST',
          symbol: 'tDAI',
          decimals: 1,
          quantum: '1',
          __typename: 'Asset',
        },
        quoteName: '',
        dataSourceSpecBinding: {
          __typename: 'DataSourceSpecToFutureBinding',
          settlementDataProperty: '',
          tradingTerminationProperty: '',
        },
        dataSourceSpecForSettlementData: {
          __typename: 'DataSourceDefinition',
          sourceType: {
            __typename: 'DataSourceDefinitionInternal',
          },
        },
        dataSourceSpecForTradingTermination: {
          __typename: 'DataSourceDefinition',
          sourceType: {
            __typename: 'DataSourceDefinitionInternal',
          },
        },
        __typename: 'FutureProduct',
      },
      __typename: 'InstrumentConfiguration',
    },
    __typename: 'NewMarket',
  } as const;
  const defaultProposal: ProposalListFieldsFragment = {
    id: 'e9ec6d5c46a7e7bcabf9ba7a893fa5a5eeeec08b731f06f7a6eb7bf0e605b829',
    reference: 'injected_at_runtime',
    state: Schema.ProposalState.STATE_OPEN,
    datetime: '2022-11-15T12:38:55.901696Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '20000000000000000000000000',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-15T12:44:34Z',
      enactmentDatetime: '2022-11-15T12:44:54Z',
      change: newMarket,
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  };
  return merge(defaultProposal, override);
};

const proposalListFields: ProposalListFieldsFragment[] = [
  createProposalListFieldsFragment(),
  {
    id: '1cd1deb532b97fbeb9262fe94499ecec5835e60ae564b7c5af530c90a13c29cb',
    reference: 'injected_at_runtime',
    state: Schema.ProposalState.STATE_REJECTED,
    datetime: '2022-11-15T12:38:08.810603Z',
    votes: {
      yes: {
        totalTokens: '0',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '0',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-15T12:39:41Z',
      enactmentDatetime: '2022-11-15T12:39:51Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'ETHUSD',
          name: 'ETHUSD',
          product: {
            settlementAsset: {
              id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
              name: 'tDAI TEST',
              symbol: 'tDAI',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: 'e503cadb437861037cddfd7263d25b69102098a97573db23f8e5fc320cea1ce9',
    reference: 'injected_at_runtime',
    state: Schema.ProposalState.STATE_PASSED,
    datetime: '2022-11-14T16:18:57.437675Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '10000000000000000000000000',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-14T16:24:24Z',
      enactmentDatetime: '2022-11-14T16:24:34Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'LINKUSD',
          name: 'LINKUSD',
          product: {
            settlementAsset: {
              id: 'eb30d55e90e1f9e5c4727d6fa2a5a8cd36ab9ae9738eb8f3faf53e2bee4861ee',
              name: 'mUSDT-II',
              symbol: 'mUSDT-II',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: 'e38415b453d862c246743fa979b877d97e2c9cbe160b6174e02c5589864817a0',
    reference: 'injected_at_runtime',
    state: Schema.ProposalState.STATE_REJECTED,
    datetime: '2022-11-14T16:17:09.605382Z',
    votes: {
      yes: {
        totalTokens: '0',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '0',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:32:22Z',
      enactmentDatetime: '2022-11-11T16:32:32Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'LINKUSD',
          name: 'LINKUSD',
          product: {
            settlementAsset: {
              id: 'eb30d55e90e1f9e5c4727d6fa2a5a8cd36ab9ae9738eb8f3faf53e2bee4861ee',
              name: 'mUSDT-II',
              symbol: 'mUSDT-II',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: 'e3119d341022a401cc68ba3a7ead5c431028d0060b3a49fc115025d7784c646f',
    reference: 'injected_at_runtime',
    state: Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    datetime: '2022-11-14T09:35:54.040219Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '40000000000000000000000000',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-14T09:40:57Z',
      enactmentDatetime: '2022-11-14T09:41:17Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'ETHUSD',
          name: 'ETHUSD',
          product: {
            settlementAsset: {
              id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
              name: 'tDAI TEST',
              symbol: 'tDAI',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: '07549b2cf93abbf6fb8ad976af3f24876e5946df85a3b6f0a6338672c7453bfa',
    reference: 'injected_at_runtime',
    state: Schema.ProposalState.STATE_ENACTED,
    datetime: '2022-11-11T16:29:23.46877Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '0',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:32:22Z',
      enactmentDatetime: '2022-11-11T16:32:32Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'LINKUSD',
          name: 'LINKUSD',
          product: {
            settlementAsset: {
              id: 'eb30d55e90e1f9e5c4727d6fa2a5a8cd36ab9ae9738eb8f3faf53e2bee4861ee',
              name: 'mUSDT-II',
              symbol: 'mUSDT-II',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: 'de48ad0adc668a80a074e790d118b6a64fa4909fc60ebbc2c335be3b675fec93',
    reference: 'zMSg0drbaFnoM1kF8YdsbH28poqdsJr33rYwyETv',
    state: Schema.ProposalState.STATE_OPEN,
    datetime: '2022-11-11T16:27:05.914266Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '0',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:28:25Z',
      enactmentDatetime: '2022-11-11T16:30:35Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'ETHDAI.MF21',
          name: 'ETHDAI Monthly (Dec 2022)',
          product: {
            settlementAsset: {
              id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
              name: 'tDAI TEST',
              symbol: 'tDAI',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: 'c80c1cc89dcc5a302e443b7fcd215cdadbb259f6b180db6253a5572ad6406253',
    reference: 'NlotxzM5Jg3LfEN1vYCxxQ5wcmUwfWAqQQtad3Se',
    state: Schema.ProposalState.STATE_PASSED,
    datetime: '2022-11-11T16:27:05.914266Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '20000000000000000000000000',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:28:25Z',
      enactmentDatetime: '2022-11-11T16:30:35Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'AAPL.MF21',
          name: 'Apple Monthly (Dec 2022)',
          product: {
            settlementAsset: {
              id: 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
              name: 'tUSDC TEST',
              symbol: 'tUSDC',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: 'ad2e531441c2e8a43e85423db399a4acc8f9a8a2376304a4c377d0da8eb31e80',
    reference: 'rVcSDJYfk3Ni6yi9ZwVcYXFaSA6miUZucHdzdGCv',
    state: Schema.ProposalState.STATE_OPEN,
    datetime: '2022-11-11T16:27:05.220442Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '35000000000000000000000000',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:28:25Z',
      enactmentDatetime: '2022-11-11T16:30:35Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'BTCUSD.MF21',
          name: 'BTCUSD Monthly (Dec 2022)',
          product: {
            settlementAsset: {
              id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
              name: 'tDAI TEST',
              symbol: 'tDAI',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: 'acff1b95980c3355e65c7162c35917388702525c0475ba753f03d0efc9c6d6a3',
    reference: 'EMRU5vhlhKUFBx9D2sr4KWSS4PZhNhWEbRr8SMf7',
    state: Schema.ProposalState.STATE_PASSED,
    datetime: '2022-11-11T16:27:06.008336Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '0',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:28:25Z',
      enactmentDatetime: '2022-11-11T16:30:35Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'TSLA.QM21',
          name: 'Tesla Quarterly (Feb 2023)',
          product: {
            settlementAsset: {
              id: '177e8f6c25a955bd18475084b99b2b1d37f28f3dec393fab7755a7e69c3d8c3b',
              name: 'tEURO TEST',
              symbol: 'tEURO',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: '90e71c52b2f40db78efc24abe4217382993868cd24e45b3dd17147be4afaf884',
    reference: '1HpOzeaQhW3OgLlMS4uFIzrOJcK0zaGMN2ccWpF7',
    state: Schema.ProposalState.STATE_OPEN,
    datetime: '2022-11-11T16:27:05.861888Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '22000000000000000000000000',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:28:25Z',
      enactmentDatetime: '2022-11-11T16:30:35Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'AAVEDAI.MF21',
          name: 'AAVEDAI Monthly (Dec 2022)',
          product: {
            settlementAsset: {
              id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
              name: 'tDAI TEST',
              symbol: 'tDAI',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: '8b4aaea9cf7cbbeee90aa6ccea21bd5b9ec15c1872d6b0b3a58e31b741dd948a',
    reference: '9xlda7c2xrBTDVMNvsDdTSeVJqgCgvN3Uea7WPEN',
    state: Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    datetime: '2022-11-11T16:27:06.076146Z',
    votes: {
      yes: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '12345600000000000000000000',
        totalNumber: '0',
        totalWeight: '0',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:28:25Z',
      enactmentDatetime: '2022-11-11T16:30:35Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'ETHBTC.QM21',
          name: 'ETHBTC Quarterly (Feb 2023)',
          product: {
            settlementAsset: {
              id: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
              name: 'tBTC TEST',
              symbol: 'tBTC',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
  {
    id: '325dfa07e1be5192376616241d23b4d71740fe712e298130bfd35d27738f1ce4',
    reference: 'WrmmmaQE4j70M0Wauh85oNpKOA1Lp8omIcn07DLS',
    state: Schema.ProposalState.STATE_OPEN,
    datetime: '2022-11-11T16:27:05.914266Z',
    votes: {
      yes: {
        totalTokens: '10000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      no: {
        totalTokens: '50000000000000000000000000',
        totalNumber: '1',
        totalWeight: '1',
        __typename: 'ProposalVoteSide',
      },
      __typename: 'ProposalVotes',
    },
    requiredMajority: '',
    party: {
      __typename: 'Party',
      id: '',
    },
    rationale: {
      __typename: 'ProposalRationale',
      description: '',
      title: '',
    },
    requiredParticipation: '',
    errorDetails: '',
    rejectionReason: null,
    requiredLpMajority: '',
    requiredLpParticipation: '',
    terms: {
      closingDatetime: '2022-11-11T16:28:25Z',
      enactmentDatetime: '2022-11-11T16:30:35Z',
      change: {
        decimalPlaces: 1,

        riskParameters: {
          __typename: 'SimpleRiskModel',
          params: {
            __typename: 'SimpleRiskModelParams',
            factorLong: 0,
            factorShort: 1,
          },
        },
        metadata: [],
        instrument: {
          code: 'UNIDAI.MF21',
          name: 'UNIDAI Monthly (Dec 2022)',
          product: {
            settlementAsset: {
              id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
              name: 'tDAI TEST',
              symbol: 'tDAI',
              decimals: 1,
              quantum: '1',
              __typename: 'Asset',
            },
            quoteName: '',
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: '',
              tradingTerminationProperty: '',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceDefinition',
              sourceType: {
                __typename: 'DataSourceDefinitionInternal',
              },
            },
            __typename: 'FutureProduct',
          },
          __typename: 'InstrumentConfiguration',
        },
        __typename: 'NewMarket',
      },
      __typename: 'ProposalTerms',
    },
    __typename: 'Proposal',
  },
];

export const successorMarketProposalDetailsQuery = (
  override?: SuccessorMarketProposalDetailsQuery
): SuccessorMarketProposalDetailsQuery =>
  merge(
    {
      __typename: 'Query',
      proposal: {
        __typename: 'Proposal',
        terms: {
          __typename: 'ProposalTerms',
          change: {
            __typename: 'NewMarket',
            successorConfiguration: {
              __typename: 'SuccessorConfiguration',
              insurancePoolFraction: '0.75',
              parentMarketId: 'PARENT-A',
            },
          },
        },
      },
    },
    override
  );
