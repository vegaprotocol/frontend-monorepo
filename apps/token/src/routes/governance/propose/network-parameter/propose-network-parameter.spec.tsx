import { fireEvent, render, screen } from '@testing-library/react';
import { ProposeNetworkParameter } from './propose-network-parameter';
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
      governance_proposal_updateNetParam_maxClose: '8760h0m0s',
      governance_proposal_updateNetParam_maxEnact: '8760h0m0s',
      governance_proposal_updateNetParam_minClose: '1h0m0s',
      governance_proposal_updateNetParam_minEnact: '2h0m0s',
      governance_proposal_updateNetParam_minProposerBalance: '1',
      spam_protection_proposal_min_tokens: '1000000000000000000',
      market_auction_maximumDuration: '168h0m0s',
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
            <ProposeNetworkParameter />
          </VegaWalletContext.Provider>
        </AppStateProvider>
      </MockedProvider>
    </Router>
  );

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose Network Parameter', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the correct title', () => {
    renderComponent();
    expect(screen.getByText('Update network parameter proposal')).toBeTruthy();
  });

  it('should render the network param select element with no initial value', () => {
    renderComponent();
    expect(screen.getByTestId('proposal-parameter-select')).toHaveValue('');
  });

  it('should render the current param value and a new value input when the network param select element is changed', () => {
    renderComponent();
    const select = screen.getByTestId('proposal-parameter-select');
    expect(select).toHaveValue('');

    fireEvent.change(screen.getByTestId('proposal-parameter-select'), {
      target: {
        value: 'spam_protection_proposal_min_tokens',
      },
    });

    expect(select).toHaveValue('spam_protection_proposal_min_tokens');
    expect(
      screen.getByTestId('selected-proposal-param-current-value')
    ).toHaveValue('1000000000000000000');

    expect(
      screen.getByTestId('selected-proposal-param-new-value')
    ).toBeVisible();
  });
});
