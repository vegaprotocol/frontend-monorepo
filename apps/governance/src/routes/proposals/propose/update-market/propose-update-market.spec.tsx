import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter as Router } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposeUpdateMarket } from './propose-update-market';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import type { ProposalMarketsQueryQuery } from './__generated__/UpdateMarket';
import { ProposalMarketsQueryDocument } from './__generated__/UpdateMarket';
import { ProposalState } from '@vegaprotocol/types';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react';

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
              key: 'governance.proposal.updateMarket.maxClose',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateMarket.maxEnact',
              value: '8760h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateMarket.minClose',
              value: '1h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateMarket.minEnact',
              value: '2h0m0s',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateMarket.minProposerBalance',
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

const marketQueryMock: MockedResponse<ProposalMarketsQueryQuery> = {
  request: {
    query: ProposalMarketsQueryDocument,
  },
  result: {
    data: {
      marketsConnection: {
        __typename: 'MarketConnection',
        edges: [
          {
            __typename: 'MarketEdge',
            node: {
              __typename: 'Market',
              id: 'd2319c91104a523032cf04ac4e20962b87ee1f187d1e411a2cac12554dd38f29',
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'ETHUSD (September Market)',
                  code: 'ETHiUSDT',
                },
              },
              proposal: {
                __typename: 'Proposal',
                state: ProposalState.STATE_ENACTED,
              },
            },
          },
          {
            __typename: 'MarketEdge',
            node: {
              __typename: 'Market',
              id: 'bb941f84e25b3a06068e33917d01215d56a51e9abff6ff9b9a3f2cf49b495e37',
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'Las Vegas nuggets',
                  code: 'Nuggets',
                },
              },
              proposal: {
                __typename: 'Proposal',
                state: ProposalState.STATE_OPEN,
              },
            },
          },

          {
            __typename: 'MarketEdge',
            node: {
              __typename: 'Market',
              id: '976f71b8d6f99f3685297156a11245f21e49c99d3be17f2577a4bf693b5f37d1',
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'California Nuggets',
                  code: 'Nuggets2',
                },
              },
              proposal: {
                __typename: 'Proposal',
                state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
              },
            },
          },
          {
            __typename: 'MarketEdge',
            node: {
              __typename: 'Market',
              id: '1cb2e1755208914b6f258a28babd19ae8dfbaf4084d8867d8a120c50dca1e17f',
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'Nevada Nuggets',
                  code: 'Nugetts3',
                },
              },
              proposal: {
                __typename: 'Proposal',
                state: ProposalState.STATE_REJECTED,
              },
            },
          },
          {
            __typename: 'MarketEdge',
            node: {
              __typename: 'Market',
              id: 'asdfe1755208914b6f258a28babd19ae8dfbaf4084d8867d8a120c50dca1e17f',
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'NZ Nuggets',
                  code: 'Nugetts4',
                },
              },
              proposal: {
                __typename: 'Proposal',
                state: ProposalState.STATE_DECLINED,
              },
            },
          },
          {
            __typename: 'MarketEdge',
            node: {
              __typename: 'Market',
              id: 'asdfe1755208914b6f258a28babd19ae8dfbaf4084d8867d8a120c50dca1e17f',
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'Aussie Nuggets',
                  code: 'Nugetts5',
                },
              },
              proposal: {
                __typename: 'Proposal',
                state: ProposalState.STATE_PASSED,
              },
            },
          },
          {
            __typename: 'MarketEdge',
            node: {
              __typename: 'Market',
              id: 'xcvbe1755208914b6f258a28babd19ae8dfbaf4084d8867d8a120c50dca1e17f',
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'Tasmanian Nuggets',
                  code: 'Nugetts6',
                },
              },
              proposal: {
                __typename: 'Proposal',
                state: ProposalState.STATE_FAILED,
              },
            },
          },
        ],
      },
    },
  },
};

const renderComponent = () => {
  return render(
    <MockedProvider
      mocks={[updateMarketNetworkParamsQueryMock, marketQueryMock]}
      addTypename={false}
    >
      <Router>
        <MockedWalletProvider>
          <AppStateProvider>
            <ProposeUpdateMarket />
          </AppStateProvider>
        </MockedWalletProvider>
      </Router>
    </MockedProvider>
  );
};

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose Update Market', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', async () => {
    renderComponent();

    await waitFor(() =>
      expect(screen.getByText('Update market proposal')).toBeInTheDocument()
    );
  });

  it('should render the form components', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByTestId('update-market-proposal-form')).toBeTruthy()
    );
    expect(screen.getByTestId('min-proposal-requirements')).toBeTruthy();
    expect(screen.getByTestId('proposal-title')).toBeTruthy();
    expect(screen.getByTestId('proposal-description')).toBeTruthy();
    expect(screen.getByTestId('proposal-terms')).toBeTruthy();
    expect(screen.getByTestId('proposal-vote-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-enactment-deadline')).toBeTruthy();

    expect(screen.getByTestId('proposal-download-json')).toBeTruthy();
    expect(screen.getByTestId('proposal-transaction-dialog')).toBeTruthy();
  });

  it('should render the select element with no initial value', async () => {
    renderComponent();
    expect(
      await screen.findByText('Update market proposal')
    ).toBeInTheDocument();
    expect(screen.getByTestId('proposal-market-select')).toHaveValue('');
  });

  it('should only render enacted markets', async () => {
    renderComponent();
    expect(
      await screen.findByText('Update market proposal')
    ).toBeInTheDocument();
    // (state enacted)
    expect(screen.getByText('ETHUSD (September Market)')).toBeInTheDocument();
    // (state open)
    expect(screen.queryByText('Las Vegas nuggets')).not.toBeInTheDocument();
    // (state waiting for node vote)
    expect(screen.queryByText('California nuggets')).not.toBeInTheDocument();
    // (state rejected)
    expect(screen.queryByText('Nevada nuggets')).not.toBeInTheDocument();
    // (state declined)
    expect(screen.queryByText('NZ nuggets')).not.toBeInTheDocument();
    // (state passed)
    expect(screen.queryByText('Aussie nuggets')).not.toBeInTheDocument();
    // (state failed)
    expect(screen.queryByText('Tasmanian nuggets')).not.toBeInTheDocument();
  });

  it('should render the correct market details when the market select is used', async () => {
    renderComponent();
    expect(
      await screen.findByText('Update market proposal')
    ).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('proposal-market-select'), {
      target: {
        value:
          'd2319c91104a523032cf04ac4e20962b87ee1f187d1e411a2cac12554dd38f29',
      },
    });

    expect(screen.getByTestId('proposal-market-select')).toHaveValue(
      'd2319c91104a523032cf04ac4e20962b87ee1f187d1e411a2cac12554dd38f29'
    );

    expect(screen.getByTestId('update-market-details')).toHaveTextContent(
      'ETHUSD (September Market)'
    );
    expect(screen.getByTestId('update-market-details')).toHaveTextContent(
      'ETHiUSDT'
    );
    expect(screen.getByTestId('update-market-details')).toHaveTextContent(
      'd2319c91104a523032cf04ac4e20962b87ee1f187d1e411a2cac12554dd38f29'
    );
  });
});
