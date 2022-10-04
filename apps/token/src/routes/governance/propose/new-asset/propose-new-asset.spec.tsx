import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { mockWalletContext } from '../../test-helpers/mocks';
import { ProposeNewAsset } from './propose-new-asset';
import type { NetworkParamsQuery } from '@vegaprotocol/web3';
import type { MockedResponse } from '@apollo/client/testing';
import { NETWORK_PARAMETERS_QUERY } from '@vegaprotocol/react-helpers';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_DOCS_URL: 'https://docs.vega.xyz',
  }),
}));

const updateMarketNetworkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NETWORK_PARAMETERS_QUERY,
  },
  result: {
    data: {
      networkParameters: [
        {
          __typename: 'NetworkParameter',
          key: 'governance.proposal.asset.maxClose',
          value: '8760h0m0s',
        },
        {
          __typename: 'NetworkParameter',
          key: 'governance.proposal.asset.maxEnact',
          value: '8760h0m0s',
        },
        {
          __typename: 'NetworkParameter',
          key: 'governance.proposal.asset.minClose',
          value: '1h0m0s',
        },
        {
          __typename: 'NetworkParameter',
          key: 'governance.proposal.asset.minEnact',
          value: '2h0m0s',
        },
        {
          __typename: 'NetworkParameter',
          key: 'governance.proposal.asset.minProposerBalance',
          value: '1',
        },
        {
          __typename: 'NetworkParameter',
          key: 'spam.protection.proposal.min.tokens',
          value: '1000000000000000000',
        },
      ],
    },
  },
};

const renderComponent = () =>
  render(
    <Router>
      <MockedProvider mocks={[updateMarketNetworkParamsQueryMock]}>
        <AppStateProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <ProposeNewAsset />
          </VegaWalletContext.Provider>
        </AppStateProvider>
      </MockedProvider>
    </Router>
  );

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose New Asset', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderComponent();
    await expect(baseElement).toBeTruthy();
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
    expect(screen.getByTestId('proposal-submit')).toBeTruthy();
    expect(screen.getByTestId('proposal-transaction-dialog')).toBeTruthy();
  });
});
