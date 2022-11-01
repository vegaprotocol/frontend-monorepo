import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { Proposal } from './proposal';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useNetworkParams: jest.fn(() => ({
    params: {
      governance_proposal_asset_minVoterBalance: '1',
      governance_proposal_freeform_minVoterBalance: '0',
      governance_proposal_market_minVoterBalance: '1',
      governance_proposal_updateAsset_minVoterBalance: '0',
      governance_proposal_updateMarket_minVoterBalance: '1',
      governance_proposal_updateNetParam_minVoterBalance: '1',
      spam_protection_voting_min_tokens: '1000000000000000000',
    },
    loading: false,
    error: null,
  })),
}));
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

it('Renders with data-testid', async () => {
  const proposal = generateProposal();
  render(<Proposal proposal={proposal as Proposal_proposal} />);
  expect(await screen.findByTestId('proposal')).toBeInTheDocument();
});

it('renders each section', async () => {
  const proposal = generateProposal();
  render(<Proposal proposal={proposal as Proposal_proposal} />);
  expect(await screen.findByTestId('proposal-header')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-change-table')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-terms-json')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-votes-table')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-vote-details')).toBeInTheDocument();
});
