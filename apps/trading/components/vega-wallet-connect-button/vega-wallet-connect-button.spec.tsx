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

it('Not connected', () => {
  render(generateJsx({ pubKey: null } as VegaWalletContextShape));

  const button = screen.getByTestId('connect-vega-wallet');
  expect(button).toHaveTextContent('Connect Vega wallet');
  fireEvent.click(button);
  expect(mockUpdateDialogOpen).toHaveBeenCalled();
});

it('Connected', async () => {
  const pubKey = { publicKey: '123456__123456', name: 'test' };
  render(
    generateJsx({
      pubKey: pubKey.publicKey,
      pubKeys: [pubKey],
    } as VegaWalletContextShape)
  );

  const button = screen.getByTestId('manage-vega-wallet');
  expect(button).toHaveTextContent(truncateByChars(pubKey.publicKey));
  userEvent.click(button);
  expect(mockUpdateDialogOpen).not.toHaveBeenCalled();
});
