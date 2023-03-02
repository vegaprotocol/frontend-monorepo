import { generateProposal } from '../../test-helpers/generate-proposals';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { RejectedProposalsList } from './rejected-proposals-list';
import { ProposalState } from '@vegaprotocol/types';
import { render, screen, within } from '@testing-library/react';
import {
  mockWalletContext,
  networkParamsQueryMock,
  nextWeek,
  lastMonth,
} from '../../test-helpers/mocks';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

const rejectedProposalClosesNextWeek = generateProposal({
  id: 'rejected1',
  state: ProposalState.STATE_OPEN,
  party: {
    id: 'bvcx',
  },
  terms: {
    closingDatetime: nextWeek.toString(),
    enactmentDatetime: nextWeek.toString(),
  },
});

const rejectedProposalClosedLastMonth = generateProposal({
  id: 'rejected2',
  state: ProposalState.STATE_REJECTED,
  terms: {
    closingDatetime: lastMonth.toString(),
    enactmentDatetime: lastMonth.toString(),
  },
});

const renderComponent = (proposals: ProposalQuery['proposal'][]) => (
  <Router>
    <MockedProvider mocks={[networkParamsQueryMock]}>
      <AppStateProvider>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <RejectedProposalsList proposals={proposals} />
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

describe('Rejected proposals list', () => {
  it('Renders a list of proposals', () => {
    render(
      renderComponent([
        rejectedProposalClosedLastMonth,
        rejectedProposalClosesNextWeek,
      ])
    );
    const rejectedProposals = within(screen.getByTestId('rejected-proposals'));
    const rejectedProposalsItems = rejectedProposals.getAllByTestId(
      'proposals-list-item'
    );
    expect(rejectedProposalsItems).toHaveLength(2);
  });

  it('Displays text when there are no proposals', () => {
    render(renderComponent([]));
    expect(screen.queryByTestId('rejected-proposals')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-rejected-proposals')).toBeInTheDocument();
  });
});
