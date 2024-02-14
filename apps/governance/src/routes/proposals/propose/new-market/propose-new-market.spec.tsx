import { render, screen } from '@testing-library/react';
import { ProposeNewMarket } from './propose-new-market';
import { MockedProvider } from '@apollo/client/testing';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { BrowserRouter as Router } from 'react-router-dom';
import type { MockedResponse } from '@apollo/client/testing';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import * as walletHooks from '@vegaprotocol/wallet-react';

jest.mock('@vegaprotocol/wallet-react');

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  DocsLinks: {
    PROPOSALS_GUIDE: 'https://docs.vega.xyz/tutorials/proposals',
  },
}));

const newMarketNetworkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
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
              key: 'governance.proposal.market.maxClose',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.market.maxEnact',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.market.minClose',
              value: '1h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.market.minEnact',
              value: '2h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.market.minProposerBalance',
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
  // @ts-ignore wrong types from mock
  walletHooks.useVegaWallet.mockReturnValue({ pubKey: '0x123' });
  return render(
    <Router>
      <MockedProvider mocks={[newMarketNetworkParamsQueryMock]}>
        <AppStateProvider>
          <ProposeNewMarket />
        </AppStateProvider>
      </MockedProvider>
    </Router>
  );
};

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose New Market', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the form components', async () => {
    renderComponent();
    expect(await screen.findByTestId('new-market-proposal-form')).toBeTruthy();
    expect(screen.getByTestId('min-proposal-requirements')).toBeTruthy();
    expect(screen.getByTestId('proposal-docs-link')).toBeTruthy();
    expect(screen.getByTestId('proposal-title')).toBeTruthy();
    expect(screen.getByTestId('proposal-description')).toBeTruthy();
    expect(screen.getByTestId('proposal-terms')).toBeTruthy();
    expect(screen.getByTestId('proposal-vote-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-enactment-deadline')).toBeTruthy();

    expect(screen.getByTestId('proposal-download-json')).toBeTruthy();
    expect(screen.getByTestId('proposal-transaction-dialog')).toBeTruthy();
  });
});
