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

jest.mock('../../../../hooks/use-network-param.tsx', () => ({
  useNetworkParamWithKeys: () => ({
    data: [
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.freeform.maxClose',
        value: '8760h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.freeform.maxEnact',
        value: '8760h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.freeform.minClose',
        value: '1h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.freeform.minEnact',
        value: '2h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.freeform.minProposerBalance',
        value: '1',
      },
      {
        __typename: 'NetworkParameter',
        key: 'spam.protection.freeform.min.tokens',
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
