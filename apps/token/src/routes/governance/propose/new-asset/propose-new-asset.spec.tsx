import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import {
  mockWalletContext,
  networkParamsQueryMock,
} from '../../test-helpers/mocks';
import { ProposeNewAsset } from './propose-new-asset';

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useNetworkParams: () => ({
    params: {
      governance_proposal_asset_maxClose: '8760h0m0s',
      governance_proposal_asset_maxEnact: '8760h0m0s',
      governance_proposal_asset_minClose: '1h0m0s',
      governance_proposal_asset_minEnact: '2h0m0s',
      governance_proposal_asset_minProposerBalance: '1',
      spam_protection_proposal_min_tokens: '1000000000000000000',
    },
    loading: false,
    error: undefined,
  }),
}));

const renderComponent = () =>
  render(
    <Router>
      <MockedProvider mocks={[networkParamsQueryMock]}>
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
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', () => {
    renderComponent();
    expect(screen.getByText('New asset proposal')).toBeTruthy();
  });
});
