import { render, screen } from '@testing-library/react';
import { ProposalRejectionReason, ProposalState } from '@vegaprotocol/types';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';

import { generateProposal } from '../../test-helpers/generate-proposals';
import { ProposalChangeTable } from './proposal-change-table';

it('Renders with data-testid', () => {
  const proposal = generateProposal();
  render(<ProposalChangeTable proposal={proposal} />);
  expect(screen.getByTestId('proposal-change-table')).toBeInTheDocument();
});

it('Renders all data for table', () => {
  const proposal = generateProposal();
  render(<ProposalChangeTable proposal={proposal} />);
  expect(screen.getByText('ID')).toBeInTheDocument();
  expect(screen.getByText(proposal?.id as string)).toBeInTheDocument();
  expect(screen.getByText('Closes on')).toBeInTheDocument();
  expect(
    screen.getByText(
      formatDateWithLocalTimezone(new Date(proposal?.terms.closingDatetime))
    )
  ).toBeInTheDocument();
  expect(screen.getByText('Proposed enactment')).toBeInTheDocument();
  expect(
    screen.getByText(
      formatDateWithLocalTimezone(
        new Date(proposal?.terms.enactmentDatetime || 0)
      )
    )
  ).toBeInTheDocument();
  expect(screen.getByText('Proposed by')).toBeInTheDocument();
  expect(screen.getByText(proposal?.party.id ?? '')).toBeInTheDocument();
  expect(screen.getByText('Proposed on')).toBeInTheDocument();
  expect(
    screen.getByText(formatDateWithLocalTimezone(new Date(proposal?.datetime)))
  ).toBeInTheDocument();
});

it('Changes data based on if data is in future or past', () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_ENACTED,
  });
  render(<ProposalChangeTable proposal={proposal} />);
  expect(screen.getByText('Closed on')).toBeInTheDocument();
  expect(
    screen.getByText(
      formatDateWithLocalTimezone(new Date(proposal?.terms.closingDatetime))
    )
  ).toBeInTheDocument();
  expect(screen.getByText('Enacted on')).toBeInTheDocument();
  expect(
    screen.getByText(
      formatDateWithLocalTimezone(
        new Date(proposal?.terms.enactmentDatetime || 0)
      )
    )
  ).toBeInTheDocument();
});

it('Does not render enactment time for freeform proposal', () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_ENACTED,
    terms: {
      __typename: 'ProposalTerms',
      change: {
        __typename: 'NewFreeform',
      },
    },
  });
  render(<ProposalChangeTable proposal={proposal} />);
  expect(screen.queryByText('Enacted on')).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      formatDateWithLocalTimezone(
        new Date(proposal?.terms.enactmentDatetime || 0)
      )
    )
  ).not.toBeInTheDocument();
});

it('Renders error details and rejection reason if present', () => {
  const errorDetails = 'Error message';
  const proposal = generateProposal({
    errorDetails,
    rejectionReason: ProposalRejectionReason.PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE,
  });
  render(<ProposalChangeTable proposal={proposal} />);
  expect(screen.getByText('Error details')).toBeInTheDocument();
  expect(screen.getByText(errorDetails)).toBeInTheDocument();
  expect(screen.getByText('Rejection reason')).toBeInTheDocument();
  expect(
    screen.getByText(ProposalRejectionReason.PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE)
  ).toBeInTheDocument();
});
