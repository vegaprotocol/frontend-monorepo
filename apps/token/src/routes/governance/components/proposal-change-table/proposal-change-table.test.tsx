import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';

import {
  ProposalRejectionReason,
  ProposalState,
} from '../../../../__generated__/globalTypes';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
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
  expect(screen.getByText(proposal.id as string)).toBeInTheDocument();

  expect(screen.getByText('State')).toBeInTheDocument();
  expect(screen.getByText('Open')).toBeInTheDocument();

  expect(screen.getByText('Closes on')).toBeInTheDocument();
  expect(
    screen.getByText(
      format(new Date(proposal.terms.closingDatetime), DATE_FORMAT_DETAILED)
    )
  ).toBeInTheDocument();

  expect(screen.getByText('Proposed enactment')).toBeInTheDocument();
  expect(
    screen.getByText(
      format(new Date(proposal.terms.enactmentDatetime), DATE_FORMAT_DETAILED)
    )
  ).toBeInTheDocument();

  expect(screen.getByText('Proposed by')).toBeInTheDocument();
  expect(screen.getByText(proposal.party.id)).toBeInTheDocument();

  expect(screen.getByText('Proposed on')).toBeInTheDocument();
  expect(
    screen.getByText(format(new Date(proposal.datetime), DATE_FORMAT_DETAILED))
  ).toBeInTheDocument();

  expect(screen.getByText('Type')).toBeInTheDocument();
  expect(
    screen.getByText(proposal.terms.change.__typename)
  ).toBeInTheDocument();
});

it('Changes data based on if data is in future or past', () => {
  const proposal = generateProposal({
    state: ProposalState.Enacted,
  });
  render(<ProposalChangeTable proposal={proposal} />);

  expect(screen.getByText('State')).toBeInTheDocument();
  expect(screen.getByText('Enacted')).toBeInTheDocument();

  expect(screen.getByText('Closed on')).toBeInTheDocument();
  expect(
    screen.getByText(
      format(new Date(proposal.terms.closingDatetime), DATE_FORMAT_DETAILED)
    )
  ).toBeInTheDocument();

  expect(screen.getByText('Enacted on')).toBeInTheDocument();
  expect(
    screen.getByText(
      format(new Date(proposal.terms.enactmentDatetime), DATE_FORMAT_DETAILED)
    )
  ).toBeInTheDocument();
});

it('Renders error details and rejection reason if present', () => {
  const errorDetails = 'Error message';
  const proposal = generateProposal({
    errorDetails,
    rejectionReason: ProposalRejectionReason.CloseTimeTooLate,
  });
  render(<ProposalChangeTable proposal={proposal} />);
  expect(screen.getByText('Error details')).toBeInTheDocument();
  expect(screen.getByText(errorDetails)).toBeInTheDocument();

  expect(screen.getByText('Rejection reason')).toBeInTheDocument();
  expect(
    screen.getByText(ProposalRejectionReason.CloseTimeTooLate)
  ).toBeInTheDocument();
});
