import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';
import userEvent from '@testing-library/user-event';
import {
  mockConfig,
  MockedWalletProvider,
} from '@vegaprotocol/wallet-react/testing';
import { MockedProvider, type MockedResponse } from '@apollo/react-testing';
import {
  PartyProfilesDocument,
  type PartyProfilesQuery,
} from '../../lib/hooks/__generated__/PartyProfiles';

const key = { publicKey: '123456__123456', name: 'test' };
const key2 = { publicKey: 'abcdef__abcdef', name: 'test2' };
const keys = [key, key2];
const keyProfile = {
  __typename: 'PartyProfile' as const,
  partyId: key.publicKey,
  alias: `${key.name} alias`,
  metadata: [],
};

const renderComponent = (mockOnClick = jest.fn()) => {
  const partyProfilesMock: MockedResponse<PartyProfilesQuery> = {
    request: {
      query: PartyProfilesDocument,
      variables: { partyIds: keys.map((k) => k.publicKey) },
    },
    result: {
      data: {
        partiesProfilesConnection: {
          __typename: 'PartiesProfilesConnection',
          edges: [
            {
              __typename: 'PartyProfileEdge',
              node: keyProfile,
            },
          ],
        },
      },
    },
  };

  return (
    <MemoryRouter>
      <MockedProvider mocks={[partyProfilesMock]}>
        <MockedWalletProvider>
          <VegaWalletConnectButton onClick={mockOnClick} />
        </MockedWalletProvider>
      </MockedProvider>
    </MemoryRouter>
  );
};

describe('VegaWalletConnectButton', () => {
  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  it('should fire dialog when not connected', async () => {
    const onClick = jest.fn();
    render(renderComponent(onClick));
    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Get started');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('should render "Connect" when browser wallet is detected', async () => {
    window.vega = window.vega || ({} as Vega);
    render(renderComponent());
    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Connect');
  });

  it('should open dropdown and refresh keys when connected', async () => {
    mockConfig.store.setState({
      status: 'connected',
      keys,
      pubKey: key.publicKey,
    });

    const refreshKeys = jest.spyOn(mockConfig, 'refreshKeys');
    const disconnect = jest.spyOn(mockConfig, 'disconnect');
    const setPubKey = jest.spyOn(mockConfig.store, 'setState');

    render(renderComponent());

    expect(screen.queryByTestId('connect-vega-wallet')).not.toBeInTheDocument();
    const button = screen.getByTestId('manage-vega-wallet');
    expect(button).toHaveTextContent(key.name);

    fireEvent.click(button);

    expect(await screen.findByRole('menu')).toBeInTheDocument();
    const menuItems = await screen.findAllByRole('menuitemradio');
    expect(menuItems).toHaveLength(keys.length);

    expect(within(menuItems[0]).getByTestId('alias')).toHaveTextContent(
      keyProfile.alias
    );

    expect(within(menuItems[1]).getByTestId('alias')).toHaveTextContent(
      'No alias'
    );

    expect(refreshKeys).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId(`key-${key2.publicKey}`));
    expect(setPubKey).toHaveBeenCalledWith({ pubKey: key2.publicKey });

    fireEvent.click(screen.getByTestId('disconnect'));
    expect(disconnect).toHaveBeenCalled();
  });
});
