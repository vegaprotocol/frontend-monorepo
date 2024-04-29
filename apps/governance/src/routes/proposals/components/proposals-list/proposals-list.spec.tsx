import { generateProposal } from '../../test-helpers/generate-proposals';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { type Proposals, ProposalsList } from './proposals-list';
import { ProposalState } from '@vegaprotocol/types';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  networkParamsQueryMock,
  lastWeek,
  nextWeek,
  lastMonth,
  nextMonth,
} from '../../test-helpers/mocks';

jest.mock('../vote-details/use-user-vote', () => ({
  useUserVote: jest.fn().mockImplementation(() => ({ voteState: 'NotCast' })),
}));

jest.mock('../proposals-list-item', () => ({
  ProposalsListItem: ({ proposal }: { proposal: { id: string } }) => (
    <div data-testid="proposals-list-item" id={proposal.id} />
  ),
}));

const openProposalClosesNextMonth = generateProposal({
  id: 'proposal1',
  state: ProposalState.STATE_OPEN,
  party: {
    id: 'zxcv',
  },
  terms: {
    closingDatetime: nextMonth.toString(),
  },
});

const openProposalClosesNextWeek = generateProposal({
  id: 'proposal2',
  state: ProposalState.STATE_OPEN,
  party: {
    id: 'bvcx',
  },
  terms: {
    closingDatetime: nextWeek.toString(),
  },
});

const enactedProposalClosedLastWeek = generateProposal({
  id: 'proposal3',
  state: ProposalState.STATE_ENACTED,
  terms: {
    closingDatetime: lastWeek.toString(),
  },
});

const failedProposalClosedLastMonth = generateProposal({
  id: 'proposal4',
  state: ProposalState.STATE_FAILED,
  terms: {
    closingDatetime: lastMonth.toString(),
  },
});

const renderComponent = (proposals: Proposals) => (
  <Router>
    <MockedProvider mocks={[networkParamsQueryMock]}>
      <AppStateProvider>
        <ProposalsList proposals={proposals} />
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

describe('Proposals list', () => {
  it('Render a page title and link to the make proposal form', async () => {
    render(renderComponent([]));
    await screen.findByTestId('proposals-list');
    expect(screen.getByText('Proposals')).toBeInTheDocument();
    expect(screen.getByTestId('new-proposal-link')).toBeInTheDocument();
  });

  it('displays proposals', async () => {
    render(
      renderComponent([
        openProposalClosesNextWeek,
        openProposalClosesNextMonth,
        enactedProposalClosedLastWeek,
        failedProposalClosedLastMonth,
      ])
    );
    await screen.findByTestId('proposals-list');
    const proposals = screen.getByTestId('proposal-list-items').childNodes;
    expect(proposals.length).toBe(3);
  });

  it('Displays info on no proposals', async () => {
    render(renderComponent([]));
    await screen.findByTestId('proposals-list');
    expect(screen.queryByTestId('proposal-list-items')).not.toBeInTheDocument();
    expect(screen.queryByTestId('no-proposals')).toBeInTheDocument();
  });

  it('Opens filter form when button is clicked', async () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    await screen.findByTestId('proposals-list');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    expect(screen.queryByTestId('filter-settings')).toBeInTheDocument();
  });

  it('Filters list by text - party id', async () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    await screen.findByTestId('proposals-list');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'bvcx' },
    });
    const container = screen.getByTestId('proposals-list');
    expect(container.querySelector('#proposal2')).toBeInTheDocument();
    expect(container.querySelector('#proposal1')).not.toBeInTheDocument();
  });

  it('Filters list by text - proposal id', async () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    await screen.findByTestId('proposals-list');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'proposal1' },
    });
    const container = screen.getByTestId('proposals-list');
    expect(container.querySelector('#proposal1')).toBeInTheDocument();
    expect(container.querySelector('#proposal2')).not.toBeInTheDocument();
  });

  it('Filters list by text - check for substring matching', async () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    await screen.findByTestId('proposals-list');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'osal1' },
    });
    const container = screen.getByTestId('proposals-list');
    expect(container.querySelector('#proposal1')).toBeInTheDocument();
    expect(container.querySelector('#proposal2')).not.toBeInTheDocument();
  });

  it('When filter is used, clear button is visible', async () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    await screen.findByTestId('proposals-list');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'test' },
    });
    expect(screen.getByTestId('clear-filter')).toBeInTheDocument();
  });

  it('When clear filter button is used, input is cleared', async () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    await screen.findByTestId('proposals-list');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'test' },
    });
    fireEvent.click(screen.getByTestId('clear-filter'));
    expect((screen.getByTestId('filter-input') as HTMLInputElement).value).toBe(
      ''
    );
  });
});
