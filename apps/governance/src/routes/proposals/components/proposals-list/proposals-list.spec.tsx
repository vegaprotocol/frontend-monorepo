import {
  generateProposal,
  generateProtocolUpgradeProposal,
} from '../../test-helpers/generate-proposals';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalsList } from './proposals-list';
import { ProposalState } from '@vegaprotocol/types';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  mockWalletContext,
  networkParamsQueryMock,
  lastWeek,
  nextWeek,
  lastMonth,
  nextMonth,
} from '../../test-helpers/mocks';
import { type ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { type Proposal } from '../../types';

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

const closedProtocolUpgradeProposal = generateProtocolUpgradeProposal({
  upgradeBlockHeight: '1',
});

const renderComponent = (
  proposals: Proposal,
  protocolUpgradeProposals?: ProtocolUpgradeProposalFieldsFragment[]
) => (
  <Router>
    <MockedProvider mocks={[networkParamsQueryMock]}>
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <ProposalsList
            proposals={proposals}
            protocolUpgradeProposals={protocolUpgradeProposals || []}
          />
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

jest.mock('../vote-details/use-user-vote', () => ({
  useUserVote: jest.fn().mockImplementation(() => ({ voteState: 'NotCast' })),
}));

describe('Proposals list', () => {
  it('Render a page title and link to the make proposal form', async () => {
    render(renderComponent([]));
    await screen.findByTestId('proposals-list');
    expect(screen.getByText('Proposals')).toBeInTheDocument();
    expect(screen.getByTestId('new-proposal-link')).toBeInTheDocument();
  });

  it('Will hide filter if no proposals', async () => {
    render(renderComponent([]));
    await screen.findByTestId('proposals-list');
    expect(
      screen.queryByTestId('proposals-list-filter')
    ).not.toBeInTheDocument();
  });

  it('Will show filter if there are proposals', async () => {
    render(renderComponent([enactedProposalClosedLastWeek]));
    await screen.findByTestId('proposals-list');
    expect(screen.queryByTestId('proposals-list-filter')).toBeInTheDocument();
  });

  it('Will render a link to rejected proposals', async () => {
    render(renderComponent([]));
    await screen.findByTestId('proposals-list');
    expect(screen.getByText('See rejected proposals')).toBeInTheDocument();
  });

  it('Places proposals correctly in open or closed lists', async () => {
    render(
      renderComponent([
        openProposalClosesNextWeek,
        openProposalClosesNextMonth,
        enactedProposalClosedLastWeek,
        failedProposalClosedLastMonth,
      ])
    );
    await screen.findByTestId('proposals-list');
    const openProposals = within(screen.getByTestId('open-proposals'));
    const closedProposals = within(screen.getByTestId('closed-proposals'));
    expect(openProposals.getAllByTestId('proposals-list-item').length).toBe(2);
    expect(closedProposals.getAllByTestId('proposals-list-item').length).toBe(
      2
    );
  });

  it('Displays info on no proposals', async () => {
    render(renderComponent([]));
    await screen.findByTestId('proposals-list');
    expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
    expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
  });

  it('Displays info on no open proposals if only closed are present', async () => {
    render(renderComponent([enactedProposalClosedLastWeek]));
    await screen.findByTestId('proposals-list');
    expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
    expect(screen.getByTestId('closed-proposals')).toBeInTheDocument();
    expect(screen.queryByTestId('no-closed-proposals')).not.toBeInTheDocument();
  });

  it('Displays info on no closed proposals if only open are present', async () => {
    render(renderComponent([openProposalClosesNextWeek]));
    await screen.findByTestId('proposals-list');
    expect(screen.getByTestId('open-proposals')).toBeInTheDocument();
    expect(screen.queryByTestId('no-open-proposals')).not.toBeInTheDocument();
    expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
  });

  it('Opens filter form when button is clicked', async () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    await screen.findByTestId('proposals-list');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    expect(screen.getByTestId('proposals-list-filter')).toBeInTheDocument();
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
    const container = screen.getByTestId('open-proposals');
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
    const container = screen.getByTestId('open-proposals');
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
    const container = screen.getByTestId('open-proposals');
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

  it('Displays a toggle for closed proposals if there are both closed governance proposals and closed upgrade proposals', async () => {
    render(
      renderComponent(
        [enactedProposalClosedLastWeek],
        [closedProtocolUpgradeProposal]
      )
    );
    await screen.findByTestId('proposals-list');
    expect(screen.getByTestId('toggle-closed-proposals')).toBeInTheDocument();
  });

  it('Does not display a toggle for closed proposals if there are only closed upgrade proposals', async () => {
    render(renderComponent([], [closedProtocolUpgradeProposal]));
    await screen.findByTestId('proposals-list');
    expect(
      screen.queryByTestId('toggle-closed-proposals')
    ).not.toBeInTheDocument();
  });

  it('Does not display a toggle for closed proposals if there are only closed governance proposals', async () => {
    render(renderComponent([enactedProposalClosedLastWeek]));
    await screen.findByTestId('proposals-list');
    expect(
      screen.queryByTestId('toggle-closed-proposals')
    ).not.toBeInTheDocument();
  });

  it('Does not display a toggle for closed proposals if the proposal filter is engaged', async () => {
    render(
      renderComponent(
        [enactedProposalClosedLastWeek],
        [closedProtocolUpgradeProposal]
      )
    );
    await screen.findByTestId('proposal-filter-toggle');
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'test' },
    });
    expect(
      screen.queryByTestId('toggle-closed-proposals')
    ).not.toBeInTheDocument();
  });

  it('Displays closed governance proposals by default due to default for the toggle', async () => {
    render(
      renderComponent(
        [enactedProposalClosedLastWeek],
        [closedProtocolUpgradeProposal]
      )
    );
    expect(
      await screen.findByTestId('closed-governance-proposals')
    ).toBeInTheDocument();
  });

  it('Displays closed upgrade proposals when the toggle is clicked', async () => {
    render(
      renderComponent(
        [enactedProposalClosedLastWeek],
        [closedProtocolUpgradeProposal]
      )
    );

    await screen.findByTestId('toggle-closed-proposals');
    fireEvent.click(screen.getByText('Network upgrades'));
    expect(screen.getByTestId('closed-upgrade-proposals')).toBeInTheDocument();
  });
});
