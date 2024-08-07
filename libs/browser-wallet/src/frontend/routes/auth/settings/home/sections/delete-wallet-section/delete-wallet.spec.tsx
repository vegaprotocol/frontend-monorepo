import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { DeleteWallet, locators } from './delete-wallet';
import { type DeleteWalletWarningProperties } from './delete-wallet-warning';

jest.mock('./delete-wallet-warning', () => ({
  DeleteWalletWarning: (properties: DeleteWalletWarningProperties) => (
    <button onClick={properties.onClose} data-testid="delete-wallet-warning" />
  ),
}));

describe('DeleteWallet', () => {
  it('should render trigger, title and component', async () => {
    render(<DeleteWallet />);
    expect(
      screen.getByTestId(locators.deleteWalletTrigger)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(locators.deleteWalletTrigger));
    await screen.findByTestId('delete-wallet-warning');
    expect(screen.getByTestId(locators.deleteWalletTitle)).toHaveTextContent(
      'Delete Wallet'
    );
  });

  it('resets the dialog when reset', async () => {
    render(<DeleteWallet />);
    expect(
      screen.getByTestId(locators.deleteWalletTrigger)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(locators.deleteWalletTrigger));
    await screen.findByTestId('delete-wallet-warning');
    fireEvent.click(screen.getByTestId('delete-wallet-warning'));
    await waitFor(() =>
      expect(
        screen.queryByTestId('delete-wallet-warning')
      ).not.toBeInTheDocument()
    );
  });
});
