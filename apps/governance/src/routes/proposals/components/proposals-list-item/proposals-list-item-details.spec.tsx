import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import {
  ProposalRejectionReason,
  ProposalState,
  VoteValue,
} from '@vegaprotocol/types';
import {
  generateNoVotes,
  generateProposal,
  generateYesVotes,
} from '../../test-helpers/generate-proposals';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import {
  mockPubkey,
  mockWalletContext,
  networkParamsQueryMock,
  fiveMinutes,
  fiveHours,
  fiveDays,
  lastWeek,
  nextWeek,
} from '../../test-helpers/mocks';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { UserVoteDocument } from '../vote-details/__generated__/Vote';
import faker from 'faker';

const createUserVoteQueryMock = (
  proposalId: string | undefined | null,
  value: VoteValue
) => ({
  request: {
    query: UserVoteDocument,
    variables: {
      partyId: mockPubkey.publicKey,
    },
  },
  result: {
    data: {
      party: {
        votesConnection: {
          edges: [
            {
              node: {
                proposalId,
                vote: {
                  value,
                  datetime: faker.date.past().toISOString(),
                },
              },
            },
          ],
        },
      },
    },
  },
});

const renderComponent = (
  proposal: ProposalQuery['proposal'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mocks: MockedResponse<any>[] = [networkParamsQueryMock]
) =>
  render(
    <Router>
      <MockedProvider mocks={mocks}>
        <AppStateProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <ProposalsListItemDetails proposal={proposal} />
          </VegaWalletContext.Provider>
        </AppStateProvider>
      </MockedProvider>
    </Router>
  );

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});
afterAll(() => {
  jest.useRealTimers();
});

describe('Proposals list item details', () => {
  it('Renders proposal state: Enacted', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_ENACTED,
        terms: {
          enactmentDatetime: lastWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      format(lastWeek, DATE_FORMAT_DETAILED)
    );
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
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
    );
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
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
    );
  });

  it('Renders proposal state: Update market proposal - set to pass by LP vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          yes: {
            ...generateYesVotes(0),
            totalEquityLikeShareWeight: '1000',
          },
          no: {
            ...generateNoVotes(0),
            totalEquityLikeShareWeight: '0',
          },
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Set to pass by LP vote'
    );
  });

  it('Renders proposal state: Update market proposal - set to pass by token vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          yes: {
            ...generateYesVotes(1000, 1000),
            totalEquityLikeShareWeight: '0',
          },
          no: {
            ...generateNoVotes(0),
            totalEquityLikeShareWeight: '0',
          },
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Set to pass by token vote'
    );
  });

  it('Renders proposal state: Update market proposal - set to fail', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          yes: {
            ...generateYesVotes(0),
            totalEquityLikeShareWeight: '0',
          },
          no: {
            ...generateNoVotes(0),
            totalEquityLikeShareWeight: '0',
          },
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent('Set to fail');
  });

  it('Renders proposal state: Open - 5 minutes left to vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          closingDatetime: fiveMinutes.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 minutes left to vote'
    );
  });

  it('Renders proposal state: Open - 5 hours left to vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          closingDatetime: fiveHours.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 hours left to vote'
    );
  });

  it('Renders proposal state: Open - 5 days left to vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          closingDatetime: fiveDays.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 days left to vote'
    );
  });

  it('Renders proposal state: Open - user voted for', async () => {
    const proposal = generateProposal({
      state: ProposalState.STATE_OPEN,
      terms: {
        closingDatetime: nextWeek.toString(),
      },
    });
    renderComponent(proposal, [
      networkParamsQueryMock,
      createUserVoteQueryMock(proposal?.id, VoteValue.VALUE_YES),
    ]);
    expect(await screen.findByText('You voted For')).toBeInTheDocument();
  });

  it('Renders proposal state: Open - user voted against', async () => {
    const proposal = generateProposal({
      state: ProposalState.STATE_OPEN,
      terms: {
        closingDatetime: nextWeek.toString(),
      },
    });
    renderComponent(proposal, [
      networkParamsQueryMock,
      createUserVoteQueryMock(proposal?.id, VoteValue.VALUE_NO),
    ]);
    expect(await screen.findByText('You voted Against')).toBeInTheDocument();
  });

  it('Renders proposal state: Open - participation not reached', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          no: generateNoVotes(0),
          yes: generateYesVotes(0),
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Participation not reached'
    );
  });

  it('Renders proposal state: Open - majority not reached', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          no: generateNoVotes(1, 1000000000000000000),
          yes: generateYesVotes(1, 1000000000000000000),
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Majority not reached'
    );
  });

  it('Renders proposal state: Open - will pass', () => {
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
    expect(screen.getByTestId('vote-status')).toHaveTextContent('Set to pass');
  });

  it('Renders proposal state: Declined - participation not reached', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_DECLINED,
        terms: {
          enactmentDatetime: lastWeek.toString(),
        },
        votes: {
          no: generateNoVotes(0),
          yes: generateYesVotes(0),
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Participation not reached'
    );
  });

  it('Renders proposal state: Declined - majority not reached', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_DECLINED,
        terms: {
          enactmentDatetime: lastWeek.toString(),
        },
        votes: {
          no: generateNoVotes(1, 1000000000000000000),
          yes: generateYesVotes(1, 1000000000000000000),
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Majority not reached'
    );
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
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Invalid future product'
    );
  });
});
