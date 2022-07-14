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
  amendToDate,
  lastWeek,
  nextWeek,
} from '../../test-helpers/mocks';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

const proposal = generateProposal();

const oneDay = 60 * 60 * 24;
const oneHour = 60 * 60;
const oneMinute = 60;

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

it('Enacted', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Enacted,
      terms: {
        ...proposal.terms,
        enactmentDatetime: lastWeek.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Enacted');
  expect(screen.getByTestId('vote-details')).toHaveTextContent(
    format(lastWeek, DATE_FORMAT_DETAILED)
  );
});

it('Passed', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Passed,
      terms: {
        ...proposal.terms,
        closingDatetime: lastWeek.toString(),
        enactmentDatetime: nextWeek.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Passed');
  expect(screen.getByTestId('vote-details')).toHaveTextContent(
    `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
  );
});

it('Waiting for node vote', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.WaitingForNodeVote,
      terms: {
        ...proposal.terms,
        enactmentDatetime: nextWeek.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent(
    'Waiting for node vote'
  );
  expect(screen.getByTestId('vote-details')).toHaveTextContent(
    `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
  );
});

it('Open - 5 minutes left to vote', () => {
  const fiveMinutes = amendToDate(oneMinute * 5);
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      terms: {
        ...proposal.terms,
        closingDatetime: fiveMinutes.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-details')).toHaveTextContent(
    '5 minutes left to vote'
  );
});

it('Open - 5 hours left to vote', () => {
  const fiveMinutes = amendToDate(oneHour * 5);
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      terms: {
        ...proposal.terms,
        closingDatetime: fiveMinutes.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-details')).toHaveTextContent(
    '5 hours left to vote'
  );
});

it('Open - 5 days left to vote', () => {
  const fiveMinutes = amendToDate(oneDay * 5);
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      terms: {
        ...proposal.terms,
        closingDatetime: fiveMinutes.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-details')).toHaveTextContent(
    '5 days left to vote'
  );
});

it('Open - user voted for', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      votes: {
        __typename: 'ProposalVotes',
        yes: {
          ...proposal.votes.yes,
          votes: [
            {
              __typename: 'Vote',
              value: VoteValue.Yes,
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
        ...proposal.terms,
        closingDatetime: nextWeek.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-details')).toHaveTextContent('You voted For');
});

it('Open - user voted against', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      votes: {
        __typename: 'ProposalVotes',
        no: {
          ...proposal.votes.no,
          votes: [
            {
              __typename: 'Vote',
              value: VoteValue.No,
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
        ...proposal.terms,
        closingDatetime: nextWeek.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-details')).toHaveTextContent(
    'You voted Against'
  );
});

it('Open - participation not reached', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      terms: {
        ...proposal.terms,
        enactmentDatetime: nextWeek.toString(),
      },
      votes: {
        ...proposal.votes,
        no: generateNoVotes(0),
        yes: generateYesVotes(0),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-status')).toHaveTextContent(
    'Participation not reached'
  );
});

it('Open - majority not reached', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      terms: {
        ...proposal.terms,
        enactmentDatetime: nextWeek.toString(),
      },
      votes: {
        ...proposal.votes,
        no: generateNoVotes(1, 1000000000000000000),
        yes: generateYesVotes(1, 1000000000000000000),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-status')).toHaveTextContent(
    'Majority not reached'
  );
});

it('Open - will pass', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(3000, 1000000000000000000),
        no: generateNoVotes(0),
      },
      terms: {
        ...proposal.terms,
        closingDatetime: nextWeek.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-status')).toHaveTextContent('Set to pass');
});

it('Open - will fail', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Open,
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(0),
        no: generateNoVotes(3000, 1000000000000000000),
      },
      terms: {
        ...proposal.terms,
        closingDatetime: nextWeek.toString(),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Open');
  expect(screen.getByTestId('vote-status')).toHaveTextContent('Set to fail');
});

it('Declined - participation not reached', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Declined,
      terms: {
        ...proposal.terms,
        enactmentDatetime: lastWeek.toString(),
      },
      votes: {
        ...proposal.votes,
        no: generateNoVotes(0),
        yes: generateYesVotes(0),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Declined');
  expect(screen.getByTestId('vote-status')).toHaveTextContent(
    'Participation not reached'
  );
});

it('Declined - majority not reached', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Declined,
      terms: {
        ...proposal.terms,
        enactmentDatetime: lastWeek.toString(),
      },
      votes: {
        ...proposal.votes,
        no: generateNoVotes(1, 1000000000000000000),
        yes: generateYesVotes(1, 1000000000000000000),
      },
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Declined');
  expect(screen.getByTestId('vote-status')).toHaveTextContent(
    'Majority not reached'
  );
});

it('Rejected', () => {
  render(
    renderComponent({
      ...proposal,
      state: ProposalState.Rejected,
      terms: {
        ...proposal.terms,
        enactmentDatetime: lastWeek.toString(),
      },
      rejectionReason: ProposalRejectionReason.InvalidFutureProduct,
    })
  );
  expect(screen.getByTestId('proposal-status')).toHaveTextContent('Rejected');
  expect(screen.getByTestId('vote-status')).toHaveTextContent(
    'Invalid future product'
  );
});
