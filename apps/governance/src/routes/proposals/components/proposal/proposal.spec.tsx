import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import type { VegaWalletConfig } from '@vegaprotocol/wallet';
import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { Proposal } from './proposal';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { ProposalState } from '@vegaprotocol/types';
import { mockNetworkParams } from '../../test-helpers/mocks';

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
jest.mock('../proposal-votes-table', () => ({
  ProposalVotesTable: () => <div data-testid="proposal-votes-table"></div>,
}));
jest.mock('../vote-details', () => ({
  VoteDetails: () => <div data-testid="proposal-vote-details"></div>,
}));
jest.mock('../list-asset', () => ({
  ListAsset: () => <div data-testid="proposal-list-asset"></div>,
}));

const vegaWalletConfig: VegaWalletConfig = {
  network: 'TESTNET',
  vegaUrl: 'https://vega.xyz',
  vegaWalletServiceUrl: 'https://wallet.vega.xyz',
  links: {
    explorer: 'explorer',
    concepts: 'concepts',
    chromeExtensionUrl: 'chrome',
    mozillaExtensionUrl: 'mozilla',
  },
};

const renderComponent = (proposal: ProposalQuery['proposal']) => {
  render(
    <MemoryRouter>
      <MockedProvider>
        <VegaWalletProvider config={vegaWalletConfig}>
          <Proposal
            restData={{}}
            proposal={proposal as ProposalQuery['proposal']}
            networkParams={mockNetworkParams}
          />
        </VegaWalletProvider>
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
  expect(screen.getByTestId('proposal-votes-table')).toBeInTheDocument();
  expect(screen.getByTestId('proposal-vote-details')).toBeInTheDocument();
  expect(screen.queryByTestId('proposal-list-asset')).not.toBeInTheDocument();
});

it('renders whitelist section if proposal is new asset and source is erc20', async () => {
  const proposal = generateProposal({
    terms: {
      change: {
        __typename: 'NewAsset',
        name: 'foo',
        symbol: 'FOO',
        decimals: 18,
        quantum: '1',
        source: {
          __typename: 'ERC20',
          lifetimeLimit: '1',
          withdrawThreshold: '100',
        },
      },
    },
  });
  renderComponent(proposal);

  expect(screen.getByTestId('proposal-list-asset')).toBeInTheDocument();
});
