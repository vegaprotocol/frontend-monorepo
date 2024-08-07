import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { locators as passwordFormLocators } from '@/components/password-form';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { REJECTION_ERROR_MESSAGE } from '@/lib/utils';

import { ExportPrivateKeyForm, locators } from './export-private-key-form';

jest.mock('@/contexts/json-rpc/json-rpc-context');

describe('ExportPrivateKeyForm', () => {
  it('renders notification, passphrase input, export and close buttons', () => {
    // 1128-EXPT-001 - I can see a notifications warning me about exporting my private keys
    // 1128-EXPT-002 - There is a close button on the modal
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockReturnValue({ privateKey: '0x123' }),
    });
    render(
      <ExportPrivateKeyForm
        publicKey=""
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
      screen.getByTestId(passwordFormLocators.passphraseSubmit)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.privateKeyModalClose)
    ).toBeInTheDocument();
  });

  it('renders error message if passphrase is incorrect', async () => {
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockRejectedValue(new Error(REJECTION_ERROR_MESSAGE)),
    });
    render(
      <ExportPrivateKeyForm
        publicKey=""
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
      <ExportPrivateKeyForm
        publicKey=""
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
      request: jest.fn().mockReturnValue({ secretKey: '0x123' }),
    });
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    render(
      <ExportPrivateKeyForm
        publicKey=""
        onSuccess={onSuccess}
        onClose={onClose}
      />
    );

    // Simulate user entering a password
    const passwordInput = screen.getByTestId(
      passwordFormLocators.passphraseInput
    );
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Simulate form submission
    const exportButton = screen.getByTestId(
      passwordFormLocators.passphraseSubmit
    );
    fireEvent.click(exportButton);

    // Wait for the success callback to be called
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledWith('0x123');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockReturnValue({ secretKey: '0x123' }),
    });
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    render(
      <ExportPrivateKeyForm
        publicKey=""
        onSuccess={onSuccess}
        onClose={onClose}
      />
    );

    // Simulate user clicking the close button
    const closeButton = screen.getByTestId(locators.privateKeyModalClose);
    fireEvent.click(closeButton);

    // Check if the close callback is called
    await waitFor(() => expect(onClose).toHaveBeenCalled());

    // Check if the success callback is not called
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('disabled export button if password is blank', async () => {
    // 1128-EXPT-006 - If my password is blank the export button will remain disabled
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: jest.fn().mockReturnValue({ secretKey: '0x123' }),
    });
    render(
      <ExportPrivateKeyForm
        publicKey=""
        onSuccess={jest.fn()}
        onClose={jest.fn()}
      />
    );
    const exportButton = screen.getByTestId(
      passwordFormLocators.passphraseSubmit
    );
    expect(exportButton).toBeDisabled();

    // Input password
    const passwordInput = screen.getByTestId(
      passwordFormLocators.passphraseInput
    );
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await waitFor(() => expect(exportButton).not.toBeDisabled());
  });
});
