import { fireEvent, render, screen } from '@testing-library/react';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';
import { truncateByChars } from '@vegaprotocol/utils';
import userEvent from '@testing-library/user-event';

const mockUpdateDialogOpen = jest.fn();
jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWalletDialogStore: () => mockUpdateDialogOpen,
}));

jest.mock('../../lib/hooks/use-get-current-path-id', () => ({
  useGetCurrentRouteId: jest.fn().mockReturnValue('current-route-id'),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const generateJsx = (context: VegaWalletContextShape) => {
  return (
    <VegaWalletContext.Provider value={context}>
      <VegaWalletConnectButton />
    </VegaWalletContext.Provider>
  );
};

describe('VegaWalletConnectButton', () => {
  it('should fire dialog when not connected', () => {
    render(generateJsx({ pubKey: null } as VegaWalletContextShape));

    const button = screen.getByTestId('connect-vega-wallet');
    expect(button).toHaveTextContent('Get started');
    fireEvent.click(button);
    expect(mockUpdateDialogOpen).toHaveBeenCalled();
  });

  it('should render "Connect" when browser wallet is detected', () => {
    window.vega = window.vega || ({} as Vega);
    render(generateJsx({ pubKey: null } as VegaWalletContextShape));

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
        fetchPubKeys: () => Promise.resolve([pubKey, pubKey2]),
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
