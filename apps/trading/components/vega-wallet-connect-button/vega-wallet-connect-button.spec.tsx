import { fireEvent, render, screen } from '@testing-library/react';
import { type Wallet, type Store } from '@vegaprotocol/wallet';
import { WalletContext } from '@vegaprotocol/wallet-react';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';
import { truncateByChars } from '@vegaprotocol/utils';
import userEvent from '@testing-library/user-event';

const mockUpdateDialogOpen = jest.fn();
jest.mock('@vegaprotocol/wallet-react', () => ({
  ...jest.requireActual('@vegaprotocol/wallet-react'),
  useDialogStore: () => mockUpdateDialogOpen,
}));

jest.mock('../../lib/hooks/use-get-current-route-id', () => ({
  useGetCurrentRouteId: jest.fn().mockReturnValue('current-route-id'),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const generateJsx = (context: Wallet) => {
  return (
    <WalletContext.Provider value={context}>
      <VegaWalletConnectButton />
    </WalletContext.Provider>
  );
};

describe('VegaWalletConnectButton', () => {
  it('should fire dialog when not connected', () => {
    render(generateJsx({ pubKey: null } as Wallet));

    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Get started');
    fireEvent.click(button);
    expect(mockUpdateDialogOpen).toHaveBeenCalled();
  });

  it('should render "Connect" when browser wallet is detected', () => {
    window.vega = window.vega || ({} as Vega);
    render(generateJsx({ pubKey: null } as Wallet));

    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Connect');
    fireEvent.click(button);
    expect(mockUpdateDialogOpen).toHaveBeenCalled();
  });

  it('should retrieve keys when connected', async () => {
    const pubKey = { publicKey: '123456__123456', name: 'test' };
    const pubKey2 = { publicKey: '123456__123457', name: 'test2' };
    render(
      generateJsx({
        pubKey: pubKey.publicKey,
        pubKeys: [pubKey],
        refreshKeys: () => Promise.resolve([pubKey, pubKey2]),
      } as VegaWalletContextShape)
    );

    const button = screen.getByTestId('manage-vega-wallet');
    expect(button).toHaveTextContent(truncateByChars(pubKey.publicKey));
    userEvent.click(button);
    expect(mockUpdateDialogOpen).not.toHaveBeenCalled();
  });

  it('should fetch keys when connected', async () => {
    const pubKey = { publicKey: '123456__123456', name: 'test' };
    const context = {
      pubKey: pubKey.publicKey,
      pubKeys: [pubKey],
    } as VegaWalletContextShape;
    render(generateJsx(context));

    const button = screen.getByTestId('manage-vega-wallet');
    expect(button).toHaveTextContent(truncateByChars(pubKey.publicKey));
    userEvent.click(button);
    expect(mockUpdateDialogOpen).not.toHaveBeenCalled();
  });
});
