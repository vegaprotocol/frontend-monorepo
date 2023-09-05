import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import {
  ProposalRejectionReason,
  ProposalState,
  VoteValue,
} from '@vegaprotocol/types';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import {
  generateNoVotes,
  generateProposal,
  generateYesVotes,
} from '../../test-helpers/generate-proposals';
import { ProposalHeader } from './proposal-header';
import {
  lastWeek,
  nextWeek,
  mockWalletContext,
  createUserVoteQueryMock,
} from '../../test-helpers/mocks';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { MockedResponse } from '@apollo/client/testing';
import { FLAGS } from '@vegaprotocol/environment';
import { BrowserRouter } from 'react-router-dom';
import { VoteState } from '../vote-details/use-user-vote';

jest.mock('@vegaprotocol/proposals', () => ({
  ...jest.requireActual('@vegaprotocol/proposals'),
  useSuccessorMarketProposalDetails: () => ({
    code: 'PARENT_CODE',
    parentMarketId: 'PARENT_ID',
  }),
}));

const renderComponent = (
  proposal: ProposalQuery['proposal'],
  isListItem = true,
  mocks: MockedResponse[] = [],
  voteState?: VoteState
) =>
  render(
    <AppStateProvider>
      <BrowserRouter>
        <MockedProvider mocks={mocks}>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <ProposalHeader
              proposal={proposal}
              isListItem={isListItem}
              voteState={voteState}
            />
          </VegaWalletContext.Provider>
        </MockedProvider>
      </BrowserRouter>
    </AppStateProvider>
  );

describe('Proposal header', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  it('Renders New market proposal', () => {
    const mockedFlags = jest.mocked(FLAGS);
    mockedFlags.SUCCESSOR_MARKETS = true;
    renderComponent(
      generateProposal({
        rationale: {
          title: 'New some market',
          description: 'A new some market',
        },
        terms: {
          change: {
            __typename: 'NewMarket',
            instrument: {
              __typename: 'InstrumentConfiguration',
              name: 'Some market',
              code: 'FX:BTCUSD/DEC99',
              futureProduct: {
                __typename: 'FutureProduct',
                settlementAsset: {
                  __typename: 'Asset',
                  symbol: 'tGBP',
                },
              },
            },
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent(
      'New some market'
    );
    expect(screen.getByTestId('proposal-type')).toHaveTextContent('New market');
    expect(screen.getByTestId('proposal-details')).toHaveTextContent(
      'tGBP settled future.'
    );
    expect(screen.getByTestId('proposal-successor-info')).toHaveTextContent(
      'PARENT_CODE'
    );
  });

  it('Renders Update market proposal', () => {
    renderComponent(
      generateProposal({
        rationale: {
          title: 'New market id',
        },
        terms: {
          change: {
            __typename: 'UpdateMarket',
            marketId: 'MarketId',
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent(
      'New market id'
    );
    expect(screen.getByTestId('proposal-type')).toHaveTextContent(
      'Update market'
    );
    expect(
      screen.queryByTestId('proposal-description')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('proposal-details')).toHaveTextContent(
      'Market change: MarketId'
    );
  });

  it('Renders New asset proposal - ERC20', () => {
    renderComponent(
      generateProposal({
        rationale: {
          title: 'New asset: Fake currency',
          description: '',
        },
        terms: {
          change: {
            __typename: 'NewAsset',
            name: 'Fake currency',
            symbol: 'FAKE',
            source: {
              __typename: 'ERC20',
              contractAddress: '0x0',
            },
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent(
      'New asset: Fake currency'
    );
    expect(screen.getByTestId('proposal-type')).toHaveTextContent('New asset');
    expect(screen.getByTestId('proposal-details')).toHaveTextContent(
      'Symbol: FAKE. ERC20 contract address: 0x0'
    );
  });

  it('Renders New asset proposal - BuiltInAsset', () => {
    renderComponent(
      generateProposal({
        terms: {
          change: {
            __typename: 'NewAsset',
            name: 'Fake currency',
            symbol: 'BIA',
            source: {
              __typename: 'BuiltinAsset',
              maxFaucetAmountMint: '300',
            },
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent(
      'New asset proposal'
    );
    expect(screen.getByTestId('proposal-type')).toHaveTextContent('New asset');
    expect(screen.getByTestId('proposal-details')).toHaveTextContent(
      'Symbol: BIA. Max faucet amount mint: 300'
    );
  });

  it('Renders Update network', () => {
    renderComponent(
      generateProposal({
        rationale: {
          title: 'Network parameter',
        },
        terms: {
          change: {
            __typename: 'UpdateNetworkParameter',
            networkParameter: {
              __typename: 'NetworkParameter',
              key: 'Network key',
              value: 'Network value',
            },
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent(
      'Network parameter'
    );
    expect(screen.getByTestId('proposal-type')).toHaveTextContent(
      'Network parameter'
    );
    expect(screen.getByTestId('proposal-details')).toHaveTextContent(
      'Network key to Network value'
    );
  });

  it('Renders Freeform proposal - short rationale', () => {
    renderComponent(
      generateProposal({
        id: 'short',
        rationale: {
          title: '0x0',
        },
        terms: {
          change: {
            __typename: 'NewFreeform',
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent('0x0');
    expect(screen.getByTestId('proposal-type')).toHaveTextContent('Freeform');
    expect(
      screen.queryByTestId('proposal-description')
    ).not.toBeInTheDocument();
  });

  it('Renders Freeform proposal - long rationale (105 chars) - listing', () => {
    renderComponent(
      generateProposal({
        id: 'long',
        rationale: {
          title: '0x0',
          description:
            'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean dolor.',
        },
        terms: {
          change: {
            __typename: 'NewFreeform',
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent('0x0');
    expect(screen.getByTestId('proposal-type')).toHaveTextContent('Freeform');
    // Rationale in list view is not rendered
    expect(
      screen.queryByTestId('proposal-description')
    ).not.toBeInTheDocument();
  });

  // Remove once proposals have rationale and re-enable above tests
  it('Renders Freeform proposal - id for title', () => {
    renderComponent(
      generateProposal({
        id: 'freeform id',
        rationale: {
          title: 'freeform',
        },
        terms: {
          change: {
            __typename: 'NewFreeform',
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent('freeform');
    expect(screen.getByTestId('proposal-type')).toHaveTextContent('Freeform');
    expect(
      screen.queryByTestId('proposal-description')
    ).not.toBeInTheDocument();
  });

  it('Renders asset change proposal header', () => {
    renderComponent(
      generateProposal({
        terms: {
          change: {
            __typename: 'UpdateAsset',
            assetId: 'foo',
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-type')).toHaveTextContent(
      'Update asset'
    );
    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  it("Renders unknown proposal if it's a different proposal type", () => {
    renderComponent(
      generateProposal({
        terms: {
          change: {
            // @ts-ignore unknown proposal
            __typename: 'Foo',
          },
        },
      })
    );
    expect(screen.getByTestId('proposal-title')).toHaveTextContent(
      'Unknown proposal'
    );
  });

  it('Renders proposal state: Enacted', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_ENACTED,
        terms: {
          enactmentDatetime: lastWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Enacted');
  });

  it('Renders proposal state: Passed', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Passed');
  });

  it('Renders proposal state: Waiting for node vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
        terms: {
          enactmentDatetime: nextWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent(
      'Waiting for node vote'
    );
  });

  it('Renders proposal state: Open', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        votes: {
          __typename: 'ProposalVotes',
          yes: generateYesVotes(3000, 1000000000000000000),
          no: generateNoVotes(0),
        },
        terms: {
          closingDatetime: nextWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  });

  it('Renders proposal state: Rejected', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_REJECTED,
        terms: {
          enactmentDatetime: lastWeek.toString(),
        },
        rejectionReason:
          ProposalRejectionReason.PROPOSAL_ERROR_INVALID_FUTURE_PRODUCT,
      })
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Rejected');
  });

  it('Renders proposal state: Open - user voted against', async () => {
    const proposal = generateProposal({
      state: ProposalState.STATE_OPEN,
      terms: {
        closingDatetime: nextWeek.toString(),
      },
    });
    renderComponent(
      proposal,
      true,
      [
        // @ts-ignore generateProposal always creates an id
        createUserVoteQueryMock(proposal.id, VoteValue.VALUE_NO),
      ],
      VoteState.No
    );
    expect(await screen.findByTestId('user-voted-no')).toBeInTheDocument();
  });

  it('Renders proposal state: Open - user voted for', async () => {
    const proposal = generateProposal({
      state: ProposalState.STATE_OPEN,
      terms: {
        closingDatetime: nextWeek.toString(),
      },
    });
    renderComponent(
      proposal,
      true,
      [
        // @ts-ignore generateProposal always creates an id
        createUserVoteQueryMock(proposal.id, VoteValue.VALUE_YES),
      ],
      VoteState.Yes
    );
    expect(await screen.findByTestId('user-voted-yes')).toBeInTheDocument();
  });
});
