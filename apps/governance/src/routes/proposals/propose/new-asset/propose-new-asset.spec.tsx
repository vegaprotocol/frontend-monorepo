import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposeNewAsset } from './propose-new-asset';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import type { MockedResponse } from '@apollo/client/testing';
import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react/testing';

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  DocsLinks: {
    PROPOSALS_GUIDE: 'https://docs.vega.xyz/tutorials/proposals',
  },
}));

const newAssetNetworkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NetworkParamsDocument,
  },
  result: {
    data: {
      networkParametersConnection: {
        edges: [
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.asset.maxClose',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.asset.maxEnact',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.asset.minClose',
              value: '1h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.asset.minEnact',
              value: '2h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.asset.minProposerBalance',
              value: '1',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'spam.protection.proposal.min.tokens',
              value: '1000000000000000000',
            },
          },
        ],
      },
    },
  },
};

const renderComponent = () => {
  return render(
    <Router>
      <MockedProvider mocks={[newAssetNetworkParamsQueryMock]}>
        <MockedWalletProvider>
          <AppStateProvider>
            <ProposeNewAsset />
          </AppStateProvider>
        </MockedWalletProvider>
      </MockedProvider>
    </Router>
  );
};

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose New Asset', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', async () => {
    renderComponent();
    expect(await screen.findByText('New asset proposal')).toBeTruthy();
  });

  it('should render the form components', async () => {
    renderComponent();
    expect(await screen.findByTestId('new-asset-proposal-form')).toBeTruthy();
    expect(screen.getByTestId('min-proposal-requirements')).toBeTruthy();
    expect(screen.getByTestId('proposal-docs-link')).toBeTruthy();
    expect(screen.getByTestId('proposal-title')).toBeTruthy();
    expect(screen.getByTestId('proposal-description')).toBeTruthy();
    expect(screen.getByTestId('proposal-terms')).toBeTruthy();
    expect(screen.getByTestId('proposal-vote-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-validation-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-enactment-deadline')).toBeTruthy();

    expect(screen.getByTestId('proposal-download-json')).toBeTruthy();
    expect(screen.getByTestId('proposal-transaction-dialog')).toBeTruthy();
  });
});
