import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { VegaWalletContext } from '@vegaprotocol/wallet';
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
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

const renderComponent = (
  proposal: Proposals_proposals,
  mock = networkParamsQueryMock
) => (
  <Router>
    <MockedProvider mocks={[mock]}>
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
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_ENACTED,
          terms: {
            enactmentDatetime: lastWeek.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Enacted');
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      format(lastWeek, DATE_FORMAT_DETAILED)
    );
  });

  it('Renders proposal state: Passed', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_PASSED,
          terms: {
            closingDatetime: lastWeek.toString(),
            enactmentDatetime: nextWeek.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Passed');
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
    );
  });

  it('Renders proposal state: Waiting for node vote', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
          terms: {
            enactmentDatetime: nextWeek.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent(
      'Waiting for node vote'
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
    );
  });

  it('Renders proposal state: Open - 5 minutes left to vote', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_OPEN,
          terms: {
            closingDatetime: fiveMinutes.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 minutes left to vote'
    );
  });

  it('Renders proposal state: Open - 5 hours left to vote', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_OPEN,
          terms: {
            closingDatetime: fiveHours.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 hours left to vote'
    );
  });

  it('Renders proposal state: Open - 5 days left to vote', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_OPEN,
          terms: {
            closingDatetime: fiveDays.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 days left to vote'
    );
  });

  it('Renders proposal state: Open - user voted for', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_OPEN,
          votes: {
            __typename: 'ProposalVotes',
            yes: {
              votes: [
                {
                  __typename: 'Vote',
                  value: VoteValue.VALUE_YES,
                  datetime: lastWeek.toString(),
                  party: {
                    __typename: 'Party',
                    id: mockPubkey,
                    stake: {
                      __typename: 'PartyStake',
                      currentStakeAvailable: '1000',
                    },
                  },
                },
              ],
            },
            no: generateNoVotes(0),
          },
          terms: {
            closingDatetime: nextWeek.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      'You voted For'
    );
  });

  it('Renders proposal state: Open - user voted against', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_OPEN,
          votes: {
            __typename: 'ProposalVotes',
            no: {
              votes: [
                {
                  __typename: 'Vote',
                  value: VoteValue.VALUE_NO,
                  datetime: lastWeek.toString(),
                  party: {
                    __typename: 'Party',
                    id: mockPubkey,
                    stake: {
                      __typename: 'PartyStake',
                      currentStakeAvailable: '1000',
                    },
                  },
                },
              ],
            },
            yes: generateYesVotes(0),
          },
          terms: {
            closingDatetime: nextWeek.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      'You voted Against'
    );
  });

  it('Renders proposal state: Open - participation not reached', () => {
    render(
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
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Participation not reached'
    );
  });

  it('Renders proposal state: Open - majority not reached', () => {
    render(
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
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Majority not reached'
    );
  });

  it('Renders proposal state: Open - will pass', () => {
    render(
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
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-status')).toHaveTextContent('Set to pass');
  });

  it('Renders proposal state: Open - will fail', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_OPEN,
          votes: {
            __typename: 'ProposalVotes',
            yes: generateYesVotes(0),
            no: generateNoVotes(3000, 1000000000000000000),
          },
          terms: {
            closingDatetime: nextWeek.toString(),
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
    expect(screen.getByTestId('vote-status')).toHaveTextContent('Set to fail');
  });

  it('Renders proposal state: Declined - participation not reached', () => {
    render(
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
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Declined');
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Participation not reached'
    );
  });

  it('Renders proposal state: Declined - majority not reached', () => {
    render(
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
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Declined');
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Majority not reached'
    );
  });

  it('Renders proposal state: Rejected', () => {
    render(
      renderComponent(
        generateProposal({
          state: ProposalState.STATE_REJECTED,
          terms: {
            enactmentDatetime: lastWeek.toString(),
          },
          rejectionReason:
            ProposalRejectionReason.PROPOSAL_ERROR_INVALID_FUTURE_PRODUCT,
        })
      )
    );
    expect(screen.getByTestId('proposal-status')).toHaveTextContent('Rejected');
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Invalid future product'
    );
  });
});
