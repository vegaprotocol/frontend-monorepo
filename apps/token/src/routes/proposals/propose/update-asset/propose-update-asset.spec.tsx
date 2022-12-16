import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { mockWalletContext } from '../../test-helpers/mocks';
import { ProposeUpdateAsset } from './propose-update-asset';
import type { NetworkParamsQuery } from '@vegaprotocol/react-helpers';
import type { MockedResponse } from '@apollo/client/testing';
import { NetworkParamsDocument } from '@vegaprotocol/react-helpers';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_DOCS_URL: 'https://docs.vega.xyz',
  }),
}));

const updateAssetNetworkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
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
              key: 'governance.proposal.updateAsset.maxClose',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateAsset.maxEnact',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateAsset.minClose',
              value: '1h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateAsset.minEnact',
              value: '2h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateAsset.minProposerBalance',
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

const renderComponent = () =>
  render(
    <Router>
      <MockedProvider mocks={[updateAssetNetworkParamsQueryMock]}>
        <AppStateProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <ProposeUpdateAsset />
          </VegaWalletContext.Provider>
        </AppStateProvider>
      </MockedProvider>
    </Router>
  );

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose Update Asset', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderComponent();
    await expect(baseElement).toBeTruthy();
  });

  it('should render the title', async () => {
    renderComponent();
    expect(await screen.findByText('Update asset proposal')).toBeTruthy();
  });

  it('should render the form components', async () => {
    renderComponent();
    expect(
      await screen.findByTestId('update-asset-proposal-form')
    ).toBeTruthy();
    expect(screen.getByTestId('min-proposal-requirements')).toBeTruthy();
    expect(screen.getByTestId('proposal-docs-link')).toBeTruthy();
    expect(screen.getByTestId('proposal-title')).toBeTruthy();
    expect(screen.getByTestId('proposal-description')).toBeTruthy();
    expect(screen.getByTestId('proposal-terms')).toBeTruthy();
    expect(screen.getByTestId('proposal-vote-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-enactment-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-submit')).toBeTruthy();
    expect(screen.getByTestId('proposal-transaction-dialog')).toBeTruthy();
  });
});
