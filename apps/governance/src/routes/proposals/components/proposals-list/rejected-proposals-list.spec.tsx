import { generateProposal } from '../../test-helpers/generate-proposals';
import { RejectedProposalsList } from './rejected-proposals-list';
import { ProposalState } from '@vegaprotocol/types';
import { render, screen } from '@testing-library/react';
import { nextWeek, lastMonth } from '../../test-helpers/mocks';
import { type Proposal } from '../../types';

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

const renderComponent = (proposals: Proposal[]) => (
  <RejectedProposalsList proposals={proposals} />
);

jest.mock('../proposals-list-item', () => ({
  ProposalsListItem: () => <div data-testid="proposals-list-item" />,
}));

describe('Rejected proposals list', () => {
  it('Renders a list of proposals', () => {
    render(
      renderComponent([
        rejectedProposalClosedLastMonth,
        rejectedProposalClosesNextWeek,
      ])
    );

    expect(screen.getAllByTestId('proposals-list-item')).toHaveLength(2);
  });

  it('Displays text when there are no proposals', async () => {
    render(renderComponent([]));

    expect(screen.getByTestId('no-rejected-proposals')).toBeInTheDocument();
    expect(screen.queryByTestId('rejected-proposals')).not.toBeInTheDocument();
  });
});
