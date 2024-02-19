import { fireEvent, render, screen } from '@testing-library/react';
import { ProposeNetworkParameter } from './propose-network-parameter';
import { MockedProvider } from '@apollo/client/testing';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { MemoryRouter as Router } from 'react-router-dom';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react/testing';

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  DocsLinks: {
    PROPOSALS_GUIDE: 'https://docs.vega.xyz/tutorials/proposals',
  },
}));

const updateMarketNetworkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
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
              key: 'governance.proposal.updateNetParam.maxClose',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateNetParam.maxEnact',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateNetParam.minClose',
              value: '1h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateNetParam.minEnact',
              value: '2h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateNetParam.minProposerBalance',
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
      <MockedProvider mocks={[updateMarketNetworkParamsQueryMock]}>
        <MockedWalletProvider>
          <AppStateProvider>
            <ProposeNetworkParameter />
          </AppStateProvider>
        </MockedWalletProvider>
      </MockedProvider>
    </Router>
  );
};

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose Network Parameter', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the correct title', async () => {
    renderComponent();
    expect(
      await screen.findByText('Update network parameter proposal')
    ).toBeTruthy();
  });

  it('should render the form components', async () => {
    renderComponent();
    expect(
      await screen.findByTestId('network-parameter-proposal-form')
    ).toBeTruthy();
    expect(screen.getByTestId('min-proposal-requirements')).toBeTruthy();
    expect(screen.getByTestId('proposal-docs-link')).toBeTruthy();
    expect(screen.getByTestId('proposal-title')).toBeTruthy();
    expect(screen.getByTestId('proposal-description')).toBeTruthy();
    expect(screen.getByTestId('proposal-vote-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-enactment-deadline')).toBeTruthy();

    expect(screen.getByTestId('proposal-download-json')).toBeTruthy();
    expect(screen.getByTestId('proposal-transaction-dialog')).toBeTruthy();
  });

  it('should render the network param select element with no initial value', async () => {
    renderComponent();
    expect(await screen.findByTestId('proposal-parameter-select')).toHaveValue(
      ''
    );
  });

  it('should render the current param value and a new value input when the network param select element is changed', async () => {
    renderComponent();
    expect(await screen.findByTestId('proposal-parameter-select')).toHaveValue(
      ''
    );

    fireEvent.change(screen.getByTestId('proposal-parameter-select'), {
      target: {
        value: 'spam_protection_proposal_min_tokens',
      },
    });

    expect(screen.getByTestId('proposal-parameter-select')).toHaveValue(
      'spam_protection_proposal_min_tokens'
    );
    expect(
      screen.getByTestId('selected-proposal-param-current-value')
    ).toHaveValue('1000000000000000000');

    expect(
      screen.getByTestId('selected-proposal-param-new-value')
    ).toBeVisible();
  });
});
