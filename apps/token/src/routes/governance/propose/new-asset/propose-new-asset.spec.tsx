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

jest.mock('../../../../hooks/use-network-param.tsx', () => ({
  useNetworkParamWithKeys: () => ({
    data: [
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
