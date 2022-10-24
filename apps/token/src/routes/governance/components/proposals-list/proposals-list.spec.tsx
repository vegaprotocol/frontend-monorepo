import { generateProposal } from '../../test-helpers/generate-proposals';
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
import type { ProposalFields } from '../../__generated__/ProposalFields';

const openProposalClosesNextMonth = generateProposal({
  id: 'proposal1',
  state: ProposalState.STATE_OPEN,
  party: {
    id: 'zxcv',
  },
  terms: {
    closingDatetime: nextMonth.toString(),
    enactmentDatetime: nextMonth.toString(),
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
    enactmentDatetime: nextWeek.toString(),
  },
});

const enactedProposalClosedLastWeek = generateProposal({
  id: 'proposal3',
  state: ProposalState.STATE_ENACTED,
  terms: {
    closingDatetime: lastWeek.toString(),
    enactmentDatetime: lastWeek.toString(),
  },
});

const failedProposalClosedLastMonth = generateProposal({
  id: 'proposal4',
  state: ProposalState.STATE_FAILED,
  terms: {
    closingDatetime: lastMonth.toString(),
    enactmentDatetime: lastMonth.toString(),
  },
});

const renderComponent = (proposals: ProposalFields[]) => (
  <Router>
    <MockedProvider mocks={[networkParamsQueryMock]}>
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <ProposalsList proposals={proposals} />
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

describe('Proposals list', () => {
  it('Render a page title and link to the make proposal form', () => {
    render(renderComponent([]));
    expect(screen.getByText('Governance')).toBeInTheDocument();
    expect(screen.getByTestId('new-proposal-link')).toBeInTheDocument();
  });

  it('Will hide filter if no proposals', () => {
    render(renderComponent([]));
    expect(
      screen.queryByTestId('proposals-list-filter')
    ).not.toBeInTheDocument();
  });

  it('Will show filter if there are proposals', () => {
    render(renderComponent([enactedProposalClosedLastWeek]));
    expect(screen.queryByTestId('proposals-list-filter')).toBeInTheDocument();
  });

  it('Will render a link to rejected proposals', () => {
    render(renderComponent([]));
    expect(screen.getByText('See rejected proposals')).toBeInTheDocument();
  });

  it('Places proposals correctly in open or closed lists', () => {
    render(
      renderComponent([
        openProposalClosesNextWeek,
        openProposalClosesNextMonth,
        enactedProposalClosedLastWeek,
        failedProposalClosedLastMonth,
      ])
    );
    const openProposals = within(screen.getByTestId('open-proposals'));
    const closedProposals = within(screen.getByTestId('closed-proposals'));
    expect(openProposals.getAllByTestId('proposals-list-item').length).toBe(2);
    expect(closedProposals.getAllByTestId('proposals-list-item').length).toBe(
      2
    );
  });

  it('Orders proposals correctly by closingDateTime', () => {
    render(
      renderComponent([
        failedProposalClosedLastMonth,
        openProposalClosesNextMonth,
        openProposalClosesNextWeek,
        enactedProposalClosedLastWeek,
      ])
    );
    const openProposals = within(screen.getByTestId('open-proposals'));
    const closedProposals = within(screen.getByTestId('closed-proposals'));
    const openProposalsItems = openProposals.getAllByTestId(
      'proposals-list-item'
    );
    const closedProposalsItems = closedProposals.getAllByTestId(
      'proposals-list-item'
    );
    expect(openProposalsItems[0]).toHaveAttribute('id', 'proposal1');
    expect(openProposalsItems[1]).toHaveAttribute('id', 'proposal2');
    expect(closedProposalsItems[0]).toHaveAttribute('id', 'proposal4');
    expect(closedProposalsItems[1]).toHaveAttribute('id', 'proposal3');
  });

  it('Displays info on no proposals', () => {
    render(renderComponent([]));
    expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
    expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
  });

  it('Displays info on no open proposals if only closed are present', () => {
    render(renderComponent([enactedProposalClosedLastWeek]));
    expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
    expect(screen.getByTestId('closed-proposals')).toBeInTheDocument();
    expect(screen.queryByTestId('no-closed-proposals')).not.toBeInTheDocument();
  });

  it('Displays info on no closed proposals if only open are present', () => {
    render(renderComponent([openProposalClosesNextWeek]));
    expect(screen.getByTestId('open-proposals')).toBeInTheDocument();
    expect(screen.queryByTestId('no-open-proposals')).not.toBeInTheDocument();
    expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
  });

  it('Opens filter form when button is clicked', () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
    expect(
      screen.getByTestId('open-proposals-list-filter')
    ).toBeInTheDocument();
  });

  it('Filters list by text - party id', () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'bvcx' },
    });
    const container = screen.getByTestId('open-proposals');
    expect(container.querySelector('#proposal2')).toBeInTheDocument();
    expect(container.querySelector('#proposal1')).not.toBeInTheDocument();
  });

  it('Filters list by text - proposal id', () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'proposal1' },
    });
    const container = screen.getByTestId('open-proposals');
    expect(container.querySelector('#proposal1')).toBeInTheDocument();
    expect(container.querySelector('#proposal2')).not.toBeInTheDocument();
  });

  it('Filters list by text - check for substring matching', () => {
    render(
      renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
    );
    fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'osal1' },
    });
    const container = screen.getByTestId('open-proposals');
    expect(container.querySelector('#proposal1')).toBeInTheDocument();
    expect(container.querySelector('#proposal2')).not.toBeInTheDocument();
  });
});
