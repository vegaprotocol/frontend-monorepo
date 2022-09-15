import { render, screen } from '@testing-library/react';
import { ProposeFreeform } from './propose-freeform';
import { MockedProvider } from '@apollo/client/testing';
import {
  mockWalletContext,
  networkParamsQueryMock,
} from '../../test-helpers/mocks';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useNetworkParams: () => ({
    params: {
      governance_proposal_freeform_maxClose: '8760h0m0s',
      governance_proposal_freeform_maxEnact: '8760h0m0s',
      governance_proposal_freeform_minClose: '1h0m0s',
      governance_proposal_freeform_minEnact: '2h0m0s',
      governance_proposal_freeform_minProposerBalance: '1',
      spam_protection_freeform_min_tokens: '1000000000000000000',
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
            <ProposeFreeform />
          </VegaWalletContext.Provider>
        </AppStateProvider>
      </MockedProvider>
    </Router>
  );

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose Freeform', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', () => {
    renderComponent();
    expect(screen.getByText('New freeform proposal')).toBeTruthy();
  });
});
