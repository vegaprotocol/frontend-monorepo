import { generateProposal } from '../../test-helpers/generate-proposals';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalsList } from './proposals-list';
import { ProposalState } from '@vegaprotocol/types';
import { render, screen } from '@testing-library/react';
import {
  mockWalletContext,
  networkParamsQueryMock,
  lastMonth,
  lastWeek,
  nextMonth,
  nextWeek,
} from '../../test-helpers/mocks';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

const proposal = generateProposal();

const openProposalClosesNextMonth = {
  ...proposal,
  id: '1',
  state: ProposalState.Open,
  terms: {
    ...proposal.terms,
    closingDatetime: nextMonth.toString(),
    enactmentDatetime: nextMonth.toString(),
  },
};

const openProposalClosesNextWeek = {
  ...proposal,
  id: '2',
  state: ProposalState.Open,
  terms: {
    ...proposal.terms,
    closingDatetime: nextWeek.toString(),
    enactmentDatetime: nextWeek.toString(),
  },
};

const enactedProposalClosedLastWeek = {
  ...proposal,
  id: '3',
  state: ProposalState.Enacted,
  terms: {
    ...proposal.terms,
    closingDatetime: lastWeek.toString(),
    enactmentDatetime: lastWeek.toString(),
  },
};

const rejectedProposalClosedLastMonth = {
  ...proposal,
  id: '4',
  state: ProposalState.Rejected,
  terms: {
    ...proposal.terms,
    closingDatetime: lastMonth.toString(),
    enactmentDatetime: lastMonth.toString(),
  },
};

const failedProposal = {
  ...proposal,
  id: '5',
  state: ProposalState.Failed,
};

const renderComponent = (proposals: Proposals_proposals[]) => (
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

it('Filters out failed proposals', () => {
  render(renderComponent([failedProposal]));
  expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
  expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
  expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
  expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
});

it('Places proposals correctly in open or closed lists', () => {
  render(
    renderComponent([
      openProposalClosesNextWeek,
      openProposalClosesNextMonth,
      enactedProposalClosedLastWeek,
      rejectedProposalClosedLastMonth,
    ])
  );
  const openProposals = screen.getByTestId('open-proposals');
  const closedProposals = screen.getByTestId('closed-proposals');
  expect(
    openProposals.querySelectorAll("[data-testid='proposals-list-item']").length
  ).toBe(2);
  expect(
    closedProposals.querySelectorAll("[data-testid='proposals-list-item']")
      .length
  ).toBe(2);
});

it('Orders proposals correctly by closingDateTime', () => {
  render(
    renderComponent([
      rejectedProposalClosedLastMonth,
      openProposalClosesNextMonth,
      openProposalClosesNextWeek,
      enactedProposalClosedLastWeek,
    ])
  );
  const openProposals = screen.getByTestId('open-proposals');
  const closedProposals = screen.getByTestId('closed-proposals');
  const openProposalsItems = openProposals.querySelectorAll(
    "[data-testid='proposals-list-item']"
  );
  const closedProposalsItems = closedProposals.querySelectorAll(
    "[data-testid='proposals-list-item']"
  );
  expect(openProposalsItems[0]).toHaveAttribute('id', '1');
  expect(openProposalsItems[1]).toHaveAttribute('id', '2');
  expect(closedProposalsItems[0]).toHaveAttribute('id', '3');
  expect(closedProposalsItems[1]).toHaveAttribute('id', '4');
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
