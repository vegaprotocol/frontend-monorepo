import { fireEvent, render, screen } from '@testing-library/react';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';
import { truncateByChars } from '@vegaprotocol/utils';
import userEvent from '@testing-library/user-event';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react';
import { type Store, type Wallet } from '@vegaprotocol/wallet';

// TODO: check this
//
jest.mock('../../lib/hooks/use-get-current-route-id', () => ({
  useGetCurrentRouteId: jest.fn().mockReturnValue('current-route-id'),
}));

const renderComponent = (
  store?: Partial<Store>,
  config?: Partial<Wallet>,
  mockOnClick = jest.fn()
) => {
  return (
    <MockedWalletProvider store={store} config={config}>
      <VegaWalletConnectButton onClick={mockOnClick} />
    </MockedWalletProvider>
  );
};

describe('VegaWalletConnectButton', () => {
  it('should fire dialog when not connected', async () => {
    const onClick = jest.fn();
    render(renderComponent(undefined, undefined, onClick));
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
    const pubKey = { publicKey: '123456__123456', name: 'test' };
    const pubKey2 = { publicKey: 'abcdef__abcdef', name: 'test2' };
    const keys = [pubKey, pubKey2];

    const refreshKeys = jest.fn();
    const disconnect = jest.fn();
    const setPubKey = jest.fn();

    render(
      renderComponent(
        {
          status: 'connected',
          pubKey: pubKey.publicKey,
          keys,
          setPubKey,
        },
        {
          refreshKeys,
          disconnect,
        }
      )
    );

    const button = screen.getByTestId('manage-vega-wallet');
    expect(button).toHaveTextContent(truncateByChars(pubKey.publicKey));
    // userEvent.click doesn't work here for some reason
    fireEvent.click(button);

    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(await screen.findAllByRole('menuitemradio')).toHaveLength(
      keys.length
    );
    expect(refreshKeys).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId(`key-${pubKey2.publicKey}`));
    expect(setPubKey).toHaveBeenCalledWith(pubKey2.publicKey);

    fireEvent.click(screen.getByTestId('disconnect'));
    expect(disconnect).toHaveBeenCalled();
  });
});
