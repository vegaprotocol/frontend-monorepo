import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { Proposal } from './proposal';

jest.mock('../proposal-detail-header/proposal-header', () => ({
  ProposalHeader: () => <div data-testid="proposal-header"></div>,
}));
jest.mock('../proposal-change-table', () => ({
  ProposalChangeTable: () => <div data-testid="proposal-change-table"></div>,
}));
jest.mock('../proposal-terms-json', () => ({
  ProposalTermsJson: () => <div data-testid="proposal-terms-json"></div>,
}));
jest.mock('../proposal-votes-table', () => ({
  ProposalVotesTable: () => <div data-testid="proposal-votes-table"></div>,
}));
jest.mock('../vote-details', () => ({
  VoteDetails: () => <div data-testid="proposal-vote-details"></div>,
}));

it('Renders with data-testid', () => {
  const proposal = generateProposal();
  render(<Proposal proposal={proposal} />);
  expect(screen.getByTestId('proposal')).toBeInTheDocument();
});

it('renders each section', () => {
  const proposal = generateProposal();
  render(<Proposal proposal={proposal} />);
  expect(screen.getByTestId('proposal-header')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-change-table')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-terms-json')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-votes-table')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-vote-details')).toBeInTheDocument();
});
