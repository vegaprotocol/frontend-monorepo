import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { Proposal } from './proposal';
import { ProposalState } from '@vegaprotocol/types';
import { type Proposal as IProposal } from '../../types';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react/testing';

jest.mock('@vegaprotocol/network-parameters', () => ({
  ...jest.requireActual('@vegaprotocol/network-parameters'),
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

jest.mock('../proposal-json', () => ({
  ProposalJson: () => <div data-testid="proposal-json"></div>,
}));

jest.mock('../list-asset', () => ({
  ListAsset: () => <div data-testid="proposal-list-asset"></div>,
}));

jest.mock('../list-asset', () => ({
  ListAsset: () => <div data-testid="proposal-list-asset"></div>,
}));

jest.mock('../vote-details', () => ({
  UserVote: () => <div data-testid="user-vote"></div>,
}));

jest.mock('./proposal-change-details', () => ({
  ProposalChangeDetails: () => <div data-testid="proposal-change-details" />,
}));

const renderComponent = (proposal: IProposal) => {
  return render(
    <MemoryRouter>
      <MockedProvider>
        <MockedWalletProvider>
          <AppStateProvider>
            <Proposal restData={null} proposal={proposal} />
          </AppStateProvider>
        </MockedWalletProvider>
      </MockedProvider>
    </MemoryRouter>
  );
};

it('Renders with data-testid', async () => {
  const proposal = generateProposal();
  renderComponent(proposal);

  expect(await screen.findByTestId('proposal')).toBeInTheDocument();
});

it('Renders with a link back to "all proposals"', async () => {
  const proposal = generateProposal();
  renderComponent(proposal);

  expect(await screen.findByTestId('all-proposals-link')).toBeInTheDocument();
});

it('Renders a rejected proposals with a link back to "rejected proposals"', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_REJECTED,
  });
  renderComponent(proposal);

  expect(
    await screen.findByTestId('rejected-proposals-link')
  ).toBeInTheDocument();
});

it('renders each section', async () => {
  const proposal = generateProposal();
  renderComponent(proposal);

  expect(await screen.findByTestId('proposal-header')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-change-table')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-json')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-change-details')).toBeInTheDocument();
  expect(screen.queryByTestId('proposal-list-asset')).not.toBeInTheDocument();
});
