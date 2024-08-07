import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { locators as passwordFormLocators } from '@/components/password-form';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { WALLET_NAME } from '@/lib/create-wallet';
import { REJECTION_ERROR_MESSAGE } from '@/lib/utils';

import {
  ExportRecoveryPhraseForm,
  locators,
} from './export-recovery-phrase-form';

jest.mock('@/contexts/json-rpc/json-rpc-context');

describe('ExportRecoveryPhraseForm', () => {
  it('renders notification, passphrase input, export and close buttons', () => {
    // 1138-EXRP-003 When I do not enter a password the export button remains disabled
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockReturnValue({ privateKey: '0x123' }),
    });
    render(
      <ExportRecoveryPhraseForm
        walletName={WALLET_NAME}
        onSuccess={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Warning: Never share this key. Anyone who has access to this key will have access to your assets.'
    );
    expect(
      screen.getByTestId(passwordFormLocators.passphraseInput)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.exportRecoveryPhraseFormModalClose)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(passwordFormLocators.passphraseSubmit)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(passwordFormLocators.passphraseSubmit)
    ).toBeDisabled();
  });

  it('renders error message if passphrase is incorrect', async () => {
    // 1138-EXRP-005 When I input an incorrect password I can see this incorrect password message
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockRejectedValue(new Error(REJECTION_ERROR_MESSAGE)),
    });
    render(
      <ExportRecoveryPhraseForm
        walletName={WALLET_NAME}
        onSuccess={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const passwordInput = screen.getByTestId(
      passwordFormLocators.passphraseInput
    );
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const exportButton = screen.getByTestId(
      passwordFormLocators.passphraseSubmit
    );
    fireEvent.click(exportButton);
    await screen.findByTestId('input-error-text');
    expect(screen.getByTestId('input-error-text')).toHaveTextContent(
      'Incorrect passphrase'
    );
  });

  it('renders error message if an unknown error occurred', async () => {
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockRejectedValue(new Error('Unknown error')),
    });
    render(
      <ExportRecoveryPhraseForm
        walletName={WALLET_NAME}
        onSuccess={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const passwordInput = screen.getByTestId(
      passwordFormLocators.passphraseInput
    );
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const exportButton = screen.getByTestId(
      passwordFormLocators.passphraseSubmit
    );
    fireEvent.click(exportButton);
    await screen.findByTestId('input-error-text');
    expect(screen.getByTestId('input-error-text')).toHaveTextContent(
      'Unknown error occurred: Unknown error'
    );
  });

  it('calls onSuccess when form is submitted successfully', async () => {
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockReturnValue({ recoveryPhrase: '0x123' }),
    });
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    render(
      <ExportRecoveryPhraseForm
        walletName={WALLET_NAME}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    );

    const passwordInput = screen.getByTestId(
      passwordFormLocators.passphraseInput
    );
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const exportButton = screen.getByTestId(
      passwordFormLocators.passphraseSubmit
    );
    fireEvent.click(exportButton);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledWith('0x123');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    // 1138-EXRP-004 When I press close on the modal the modal is closed
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockReturnValue({ secretKey: '0x123' }),
    });
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    render(
      <ExportRecoveryPhraseForm
        walletName={WALLET_NAME}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByTestId(
      locators.exportRecoveryPhraseFormModalClose
    );
    fireEvent.click(closeButton);

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('disabled export button if password is blank', async () => {
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockReturnValue({ secretKey: '0x123' }),
    });
    render(
      <ExportRecoveryPhraseForm
        walletName={WALLET_NAME}
        onSuccess={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const exportButton = screen.getByTestId(
      passwordFormLocators.passphraseSubmit
    );
    expect(exportButton).toBeDisabled();

    const passwordInput = screen.getByTestId(
      passwordFormLocators.passphraseInput
    );
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await waitFor(() => expect(exportButton).not.toBeDisabled());
  });
});
