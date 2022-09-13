import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import {
  mockWalletContext,
  networkParamsQueryMock,
} from '../../test-helpers/mocks';
import { ProposeUpdateMarket } from './propose-update-market';

jest.mock('../../../../hooks/use-network-param.tsx', () => ({
  useNetworkParamWithKeys: () => ({
    data: [
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateMarket.maxClose',
        value: '8760h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateMarket.maxEnact',
        value: '8760h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateMarket.minClose',
        value: '1h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateMarket.minEnact',
        value: '2h0m0s',
      },
      {
        __typename: 'NetworkParameter',
        key: 'governance.proposal.updateMarket.minProposerBalance',
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

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(() => ({
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
                  code: 'Nuggets2',
                },
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
                  name: 'Nuggets',
                  code: 'Nuggets',
                },
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
                  name: 'CELUSD (June 2022)',
                  code: 'CELUSD',
                },
              },
            },
          },
        ],
      },
    },
    loading: false,
    error: undefined,
  })),
}));

const renderComponent = () =>
  render(
    <Router>
      <MockedProvider mocks={[networkParamsQueryMock]}>
        <AppStateProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <ProposeUpdateMarket />
          </VegaWalletContext.Provider>
        </AppStateProvider>
      </MockedProvider>
    </Router>
  );

// Note: form submission is tested in propose-raw.spec.tsx. Reusable form
// components are tested in their own directory.

describe('Propose Update Market', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the title', () => {
    renderComponent();
    expect(screen.getByText('Update market proposal')).toBeTruthy();
  });

  it('should render the select element with no initial value', () => {
    renderComponent();
    expect(screen.getByTestId('proposal-market-select')).toHaveValue('');
  });

  it('should render the correct market details when the market select is used', () => {
    renderComponent();

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
