import { fireEvent, render, screen } from '@testing-library/react';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';
import { truncateByChars } from '@vegaprotocol/utils';
import userEvent from '@testing-library/user-event';
import * as walletHooks from '@vegaprotocol/wallet-react';

let mockUpdateDialogOpen: jest.Mock;

jest.mock('@vegaprotocol/wallet-react');

jest.mock('../../lib/hooks/use-get-current-route-id', () => ({
  useGetCurrentRouteId: jest.fn().mockReturnValue('current-route-id'),
}));

beforeEach(() => {
  jest.clearAllMocks();

  mockUpdateDialogOpen = jest.fn();
  // @ts-ignore type wrong after mock
  walletHooks.useDialogStore.mockReturnValue(mockUpdateDialogOpen);
});

const generateJsx = () => {
  return <VegaWalletConnectButton />;
};

describe('VegaWalletConnectButton', () => {
  it('should fire dialog when not connected', async () => {
    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      status: 'disconnected',
      pubKey: undefined,
      pubKeys: [],
      selectPubKey: jest.fn(),
      disconnect: jest.fn(),
      refreshKeys: jest.fn(),
    });
    render(generateJsx());

    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Get started');
    await userEvent.click(button);
    expect(mockUpdateDialogOpen).toHaveBeenCalled();
  });

  it('should render "Connect" when browser wallet is detected', async () => {
    window.vega = window.vega || ({} as Vega);

    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      status: 'disconnected',
      pubKey: undefined,
      pubKeys: [],
      selectPubKey: jest.fn(),
      disconnect: jest.fn(),
      refreshKeys: jest.fn(),
    });

    render(generateJsx());

    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Connect');
    await userEvent.click(button);
    expect(mockUpdateDialogOpen).toHaveBeenCalled();
  });

  it('should open dropdown and refresh keys when connected', async () => {
    const pubKey = { publicKey: '123456__123456', name: 'test' };
    const pubKey2 = { publicKey: 'abcdef__abcdef', name: 'test2' };
    const pubKeys = [pubKey, pubKey2];

    const refreshKeys = jest.fn();
    const disconnect = jest.fn();
    const selectPubKey = jest.fn();

    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      status: 'connected',
      pubKey: pubKey.publicKey,
      pubKeys,
      selectPubKey,
      refreshKeys,
      disconnect,
    });

    render(generateJsx());

    const button = screen.getByTestId('manage-vega-wallet');
    expect(button).toHaveTextContent(truncateByChars(pubKey.publicKey));
    // userEvent.click doesn't work here for some reason
    fireEvent.click(button);

    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(await screen.findAllByRole('menuitemradio')).toHaveLength(
      pubKeys.length
    );
    expect(mockUpdateDialogOpen).not.toHaveBeenCalled();
    expect(refreshKeys).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId(`key-${pubKey2.publicKey}`));
    expect(selectPubKey).toHaveBeenCalledWith(pubKey2.publicKey);

    fireEvent.click(screen.getByTestId('disconnect'));
    expect(disconnect).toHaveBeenCalled();
  });
});
