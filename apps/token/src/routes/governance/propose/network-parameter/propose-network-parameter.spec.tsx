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

jest.mock('../../../../hooks/use-network-param.tsx', () => ({
  useNetworkParamWithKeys: () => ({
    data: [
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateNetParam.maxClose',
        value: '8760h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateNetParam.maxEnact',
        value: '8760h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateNetParam.minClose',
        value: '1h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateNetParam.minEnact',
        value: '2h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateNetParam.minProposerBalance',
        value: '1',
      },
      {
        __typename: 'NetworkParameter',
        key: 'spam.protection.proposal.min.tokens',
        value: '1000000000000000000',
      },
      {
        key: 'limits.assets.proposeEnabledFrom',
        value: '',
      },
      {
        key: 'limits.markets.proposeEnabledFrom',
        value: '',
      },
      {
        key: 'market.auction.maximumDuration',
        value: '168h0m0s',
      },
    ],
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
        value: 'spam.protection.proposal.min.tokens',
      },
    });

    expect(select).toHaveValue('spam.protection.proposal.min.tokens');
    expect(
      screen.getByTestId('selected-proposal-param-current-value')
    ).toHaveValue('1000000000000000000');

    expect(
      screen.getByTestId('selected-proposal-param-new-value')
    ).toBeVisible();
  });
});
