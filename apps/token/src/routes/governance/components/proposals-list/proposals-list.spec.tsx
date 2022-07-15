import { generateProposal } from '../../test-helpers/generate-proposals';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalsList } from './proposals-list';
import { ProposalState } from '@vegaprotocol/types';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  mockWalletContext,
  networkParamsQueryMock,
  lastMonth,
  lastWeek,
  nextMonth,
  nextWeek,
} from '../../test-helpers/mocks';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

const openProposalClosesNextMonth = generateProposal({
  id: 'proposal1',
  state: ProposalState.Open,
  party: {
    id: 'zxcv',
  },
  terms: {
    closingDatetime: nextMonth.toString(),
    enactmentDatetime: nextMonth.toString(),
  },
  rationale: {
    description: 'proposal that closes next month',
  },
});

const openProposalClosesNextWeek = generateProposal({
  id: 'proposal2',
  state: ProposalState.Open,
  party: {
    id: 'bvcx',
  },
  terms: {
    closingDatetime: nextWeek.toString(),
    enactmentDatetime: nextWeek.toString(),
  },
  rationale: {
    description: 'proposal that closes next week',
  },
});

const enactedProposalClosedLastWeek = generateProposal({
  id: 'proposal3',
  state: ProposalState.Enacted,
  terms: {
    closingDatetime: lastWeek.toString(),
    enactmentDatetime: lastWeek.toString(),
  },
});

const rejectedProposalClosedLastMonth = generateProposal({
  id: 'proposal4',
  state: ProposalState.Rejected,
  terms: {
    closingDatetime: lastMonth.toString(),
    enactmentDatetime: lastMonth.toString(),
  },
});

const failedProposal = generateProposal({
  id: 'proposal5',
  state: ProposalState.Failed,
});

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

// it('Culls failed proposals', () => {
//   render(renderComponent([failedProposal]));
//   expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
//   expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
//   expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
//   expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
// });
//
// it('Will hide filter if no proposals', () => {
//   render(renderComponent([]));
//   expect(screen.queryByTestId('proposals-list-filter')).not.toBeInTheDocument();
// });
//
// it('Will show filter if there are proposals', () => {
//   render(renderComponent([enactedProposalClosedLastWeek]));
//   expect(screen.queryByTestId('proposals-list-filter')).toBeInTheDocument();
// });
//
// it('Places proposals correctly in open or closed lists', () => {
//   render(
//     renderComponent([
//       openProposalClosesNextWeek,
//       openProposalClosesNextMonth,
//       enactedProposalClosedLastWeek,
//       rejectedProposalClosedLastMonth,
//     ])
//   );
//   const openProposals = screen.getByTestId('open-proposals');
//   const closedProposals = screen.getByTestId('closed-proposals');
//   expect(
//     openProposals.querySelectorAll("[data-testid='proposals-list-item']").length
//   ).toBe(2);
//   expect(
//     closedProposals.querySelectorAll("[data-testid='proposals-list-item']")
//       .length
//   ).toBe(2);
// });
//
// it('Orders proposals correctly by closingDateTime', () => {
//   render(
//     renderComponent([
//       rejectedProposalClosedLastMonth,
//       openProposalClosesNextMonth,
//       openProposalClosesNextWeek,
//       enactedProposalClosedLastWeek,
//     ])
//   );
//   const openProposals = screen.getByTestId('open-proposals');
//   const closedProposals = screen.getByTestId('closed-proposals');
//   const openProposalsItems = openProposals.querySelectorAll(
//     "[data-testid='proposals-list-item']"
//   );
//   const closedProposalsItems = closedProposals.querySelectorAll(
//     "[data-testid='proposals-list-item']"
//   );
//   expect(openProposalsItems[0]).toHaveAttribute('id', 'proposal1');
//   expect(openProposalsItems[1]).toHaveAttribute('id', 'proposal2');
//   expect(closedProposalsItems[0]).toHaveAttribute('id', 'proposal4');
//   expect(closedProposalsItems[1]).toHaveAttribute('id', 'proposal3');
// });

it('Displays info on no proposals', () => {
  render(renderComponent([]));
  expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
  expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
  expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
  expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
});

// it('Displays info on no open proposals if only closed are present', () => {
//   render(renderComponent([enactedProposalClosedLastWeek]));
//   expect(screen.queryByTestId('open-proposals')).not.toBeInTheDocument();
//   expect(screen.getByTestId('no-open-proposals')).toBeInTheDocument();
//   expect(screen.getByTestId('closed-proposals')).toBeInTheDocument();
//   expect(screen.queryByTestId('no-closed-proposals')).not.toBeInTheDocument();
// });
//
// it('Displays info on no closed proposals if only open are present', () => {
//   render(renderComponent([openProposalClosesNextWeek]));
//   expect(screen.getByTestId('open-proposals')).toBeInTheDocument();
//   expect(screen.queryByTestId('no-open-proposals')).not.toBeInTheDocument();
//   expect(screen.queryByTestId('closed-proposals')).not.toBeInTheDocument();
//   expect(screen.getByTestId('no-closed-proposals')).toBeInTheDocument();
// });
//
// it('Opens filter form when button is clicked', () => {
//   render(
//     renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
//   );
//   fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
//   expect(screen.getByTestId('open-proposals-list-filter')).toBeInTheDocument();
// });
//
// it('Filters list by text - proposal id', () => {
//   render(
//     renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
//   );
//   fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
//   fireEvent.change(screen.getByTestId('filter-input'), {
//     target: { value: 'proposal1' },
//   });
//   const container = screen.getByTestId('open-proposals');
//   expect(container.querySelector('#proposal1')).toBeInTheDocument();
//   expect(container.querySelector('#proposal2')).not.toBeInTheDocument();
// });
//
// it('Filters list by text - party id', () => {
//   render(
//     renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
//   );
//   fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
//   fireEvent.change(screen.getByTestId('filter-input'), {
//     target: { value: 'bvcx' },
//   });
//   const container = screen.getByTestId('open-proposals');
//   expect(container.querySelector('#proposal2')).toBeInTheDocument();
//   expect(container.querySelector('#proposal1')).not.toBeInTheDocument();
// });
//
// it('Filters list by text - proposal rationale', () => {
//   render(
//     renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
//   );
//   fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
//   fireEvent.change(screen.getByTestId('filter-input'), {
//     target: { value: 'proposal that closes next month' },
//   });
//   const container = screen.getByTestId('open-proposals');
//   expect(container.querySelector('#proposal1')).toBeInTheDocument();
//   expect(container.querySelector('#proposal2')).not.toBeInTheDocument();
// });
//
// it('Filters list by text - check for substring matching', () => {
//   render(
//     renderComponent([openProposalClosesNextMonth, openProposalClosesNextWeek])
//   );
//   fireEvent.click(screen.getByTestId('set-proposals-filter-visible'));
//   fireEvent.change(screen.getByTestId('filter-input'), {
//     target: { value: 'next month' },
//   });
//   const container = screen.getByTestId('open-proposals');
//   expect(container.querySelector('#proposal1')).toBeInTheDocument();
//   expect(container.querySelector('#proposal2')).not.toBeInTheDocument();
// });
