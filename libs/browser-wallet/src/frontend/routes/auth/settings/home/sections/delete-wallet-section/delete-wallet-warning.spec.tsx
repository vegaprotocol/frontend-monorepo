import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { WALLET_NAME } from '@/lib/create-wallet';
import { FULL_ROUTES } from '@/routes/route-names';
import { useWalletStore } from '@/stores/wallets';
import { mockStore } from '@/test-helpers/mock-store';

import {
  DeleteWalletWarning,
  type DeleteWalletWarningProperties,
  locators,
} from './delete-wallet-warning';

jest.mock('@/stores/wallets');
jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: jest.fn(),
}));

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

// eslint-disable-next-line unicorn/no-object-as-default-parameter
const renderComponent = (
  properties: DeleteWalletWarningProperties = { onClose: jest.fn() }
) => {
  mockStore(useWalletStore, { wallets: [{ name: WALLET_NAME }] });
  const mockRequest = jest.fn();
  (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
    request: mockRequest,
  });
  const view = render(
    <MemoryRouter>
      <DeleteWalletWarning {...properties} />
    </MemoryRouter>
  );
  return {
    view,
    mockRequest,
  };
};

describe('DeleteWalletWarning', () => {
  it('renders warning, checkbox, continue and close buttons', () => {
    // 1144-DLWT-001 I can see a warning message when I click the delete wallet button
    renderComponent();
    expect(
      screen.getByLabelText(
        'I have backed up my recovery phrase. I understand that I need the phrase to recover my wallet, and that if I delete it, my wallet may be lost.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.deleteWalletWarningContinueButton)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.deleteWalletWarningCloseButton)
    ).toBeInTheDocument();
  });
  it('disables the continue button when the checkbox is not checked', async () => {
    // 1144-DLWT-002 The button is disabled until I accept the message
    renderComponent();
    const checkbox = screen.getByLabelText(
      'I have backed up my recovery phrase. I understand that I need the phrase to recover my wallet, and that if I delete it, my wallet may be lost.'
    );
    expect(
      screen.getByTestId(locators.deleteWalletWarningContinueButton)
    ).toBeDisabled();
    fireEvent.click(checkbox);
    await waitFor(() =>
      expect(
        screen.getByTestId(locators.deleteWalletWarningContinueButton)
      ).not.toBeDisabled()
    );
  });
  it('closes the dialog when the close button is clicked', () => {
    const onClose = jest.fn();
    renderComponent({ onClose });
    const closeButton = screen.getByTestId(
      locators.deleteWalletWarningCloseButton
    );
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('deletes the wallet and navigates away when wallet is deleted', async () => {
    const { mockRequest } = renderComponent();
    const checkbox = screen.getByLabelText(
      'I have backed up my recovery phrase. I understand that I need the phrase to recover my wallet, and that if I delete it, my wallet may be lost.'
    );
    fireEvent.click(checkbox);
    const continueButton = screen.getByTestId(
      locators.deleteWalletWarningContinueButton
    );
    fireEvent.click(continueButton);
    await waitFor(() =>
      expect(mockRequest).toHaveBeenCalledWith(RpcMethods.DeleteWallet, {
        name: WALLET_NAME,
      })
    );
    expect(mockedUsedNavigate).toHaveBeenCalledWith(FULL_ROUTES.createWallet);
  });
});
