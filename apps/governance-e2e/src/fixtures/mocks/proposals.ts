export const proposalsData = {
  proposalsConnection: {
    edges: [
      {
        node: {
          id: 'e8ba9d268e12514644fd1fc7ff289292f4ce6489cc32cc73133aea52c04aef89',
          rationale: {
            title: 'Add asset Wrapped Ether',
            description: 'Proposal to add asset WETH to Vega network',
            __typename: 'ProposalRationale',
          },
          reference: '',
          state: 'STATE_OPEN',
          datetime: '2026-12-01T11:41:28.654288Z',
          rejectionReason: null,
          party: {
            id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            __typename: 'Party',
          },
          errorDetails: null,
          terms: {
            closingDatetime: '2026-12-01T11:45:33Z',
            enactmentDatetime: '2026-12-01T11:45:43Z',
            change: {
              name: 'Wrapped Ether',
              symbol: 'WETH',
              decimals: 18,
              quantum: '0.0008',
              source: {
                contractAddress: '0x9B18C6CaD886D5653783E2B25759124760F4407F',
                withdrawThreshold: '1',
                lifetimeLimit: '400000000000000000',
                __typename: 'ERC20',
              },
              __typename: 'NewAsset',
            },
            __typename: 'ProposalTerms',
          },
          votes: {
            yes: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            no: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            __typename: 'ProposalVotes',
          },
          __typename: 'Proposal',
        },
        __typename: 'ProposalEdge',
      },
      {
        node: {
          id: 'd848fc7881f13d366df5f61ab139d5fcfa72bf838151bb51b54381870e357931',
          rationale: {
            title: 'Add asset Dai Stablecoin',
            description: 'Proposal to add asset DAI to Vega network',
            __typename: 'ProposalRationale',
          },
          reference: '',
          state: 'STATE_ENACTED',
          datetime: '2022-11-29T15:49:57.80978Z',
          rejectionReason: null,
          party: {
            id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            __typename: 'Party',
          },
          errorDetails: null,
          terms: {
            closingDatetime: '2023-04-13T15:52:58Z',
            enactmentDatetime: '2023-04-13T15:53:08Z',
            change: {
              name: 'Dai Stablecoin',
              symbol: 'DAI',
              decimals: 18,
              quantum: '1',
              source: {
                contractAddress: '0xad018fB8ec00bfd622B91C83E684a6AC7bB8fbA4',
                withdrawThreshold: '1',
                lifetimeLimit: '500000000000000000000',
                __typename: 'ERC20',
              },
              __typename: 'NewAsset',
            },
            __typename: 'ProposalTerms',
          },
          votes: {
            yes: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            no: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            __typename: 'ProposalVotes',
          },
          __typename: 'Proposal',
        },
        __typename: 'ProposalEdge',
      },
      {
        node: {
          id: 'ccbd651b4a1167fd73c4a0340ac759fa0a31ca487ad46a13254b741ad71947ed',
          rationale: {
            title: 'New DAI market',
            description: 'New DAI market',
            __typename: 'ProposalRationale',
          },
          reference: '0VFQusmmESdrP5GuL8naB6lxfoE3RPGaEeo7abdN',
          state: 'STATE_ENACTED',
          datetime: '2022-11-26T19:36:19.26034Z',
          rejectionReason: null,
          party: {
            id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            __typename: 'Party',
          },
          errorDetails: null,
          terms: {
            closingDatetime: '2022-11-26T19:36:42Z',
            enactmentDatetime: '2023-03-22T13:57:37Z',
            change: {
              instrument: {
                name: 'UNIDAI Monthly (Dec 2022)',
                code: 'UNIDAI.MF21',
                product: {
                  settlementAsset: { symbol: 'tDAI', __typename: 'Asset' },
                  __typename: 'FutureProduct',
                },
                __typename: 'InstrumentConfiguration',
              },
              __typename: 'NewMarket',
            },
            __typename: 'ProposalTerms',
          },
          votes: {
            yes: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            no: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            __typename: 'ProposalVotes',
          },
          __typename: 'Proposal',
        },
        __typename: 'ProposalEdge',
      },
      {
        node: {
          id: 'bc70383f0e9515b15542cf4c63590cd2ca46b3363ba7c4a72af0e62112b3951b',
          rationale: {
            title: 'USDC-III',
            description: 'USDC-III D List test',
            __typename: 'ProposalRationale',
          },
          reference: '',
          state: 'STATE_ENACTED',
          datetime: '2022-11-22T15:17:28.829605Z',
          rejectionReason: null,
          party: {
            id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            __typename: 'Party',
          },
          errorDetails: null,
          terms: {
            closingDatetime: '2022-11-22T15:18:56Z',
            enactmentDatetime: '2022-11-22T15:19:06Z',
            change: {
              name: 'USDC-III',
              symbol: 'USDC-III',
              decimals: 18,
              quantum: '1',
              source: {
                contractAddress: '0x1F1A067aEC530b66BA5128C9Db76825eC22c3C6b',
                withdrawThreshold: '100000000000000000000000000',
                lifetimeLimit: '1000000000000000000000000000',
                __typename: 'ERC20',
              },
              __typename: 'NewAsset',
            },
            __typename: 'ProposalTerms',
          },
          votes: {
            yes: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            no: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            __typename: 'ProposalVotes',
          },
          __typename: 'Proposal',
        },
        __typename: 'ProposalEdge',
      },
      {
        node: {
          id: '9d9b2a9d0179d0e4ccb317f6c4a5db0b905d893190bfb5e5499985ef313281c8',
          rationale: {
            title: 'New BTC market',
            description: 'New BTC market',
            __typename: 'ProposalRationale',
          },
          reference: 'AXeRWS3TvLBFDgWOSHQpKFJf3NTbnWK6310q02fZ',
          state: 'STATE_ENACTED',
          datetime: '2022-11-26T19:36:19.26034Z',
          rejectionReason: null,
          party: {
            id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            __typename: 'Party',
          },
          errorDetails: null,
          terms: {
            closingDatetime: '2022-11-26T19:36:42Z',
            enactmentDatetime: '2023-03-22T13:57:37Z',
            change: {
              instrument: {
                name: 'ETHBTC Quarterly (Feb 2023)',
                code: 'ETHBTC.QM21',
                product: {
                  settlementAsset: { symbol: 'tBTC', __typename: 'Asset' },
                  __typename: 'FutureProduct',
                },
                __typename: 'InstrumentConfiguration',
              },
              __typename: 'NewMarket',
            },
            __typename: 'ProposalTerms',
          },
          votes: {
            yes: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            no: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            __typename: 'ProposalVotes',
          },
          __typename: 'Proposal',
        },
        __typename: 'ProposalEdge',
      },
      {
        node: {
          id: '9c48796e7988769ededc2b2b02220b00e93f65f23e8141bf1fd23a6983d95943',
          rationale: {
            title: 'Update governance.proposal.asset.requiredMajority',
            description:
              'Proposal to update governance.proposal.asset.requiredMajority to 300}',
            __typename: 'ProposalRationale',
          },
          reference: '',
          state: 'STATE_ENACTED',
          datetime: '2022-11-22T13:22:52.370655Z',
          rejectionReason: null,
          party: {
            id: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
            __typename: 'Party',
          },
          errorDetails: null,
          terms: {
            closingDatetime: '2022-11-22T13:27:13Z',
            enactmentDatetime: '2022-11-22T13:27:33Z',
            change: {
              networkParameter: {
                key: 'governance.proposal.asset.requiredParticipation',
                value: '0.000001',
                __typename: 'NetworkParameter',
              },
              __typename: 'UpdateNetworkParameter',
            },
            __typename: 'ProposalTerms',
          },
          votes: {
            yes: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            no: {
              totalTokens: '0',
              totalNumber: '0',
              totalEquityLikeShareWeight: '0',
              __typename: 'ProposalVoteSide',
            },
            __typename: 'ProposalVotes',
          },
          __typename: 'Proposal',
        },
        __typename: 'ProposalEdge',
      },
    ],
    __typename: 'ProposalsConnection',
  },
};
