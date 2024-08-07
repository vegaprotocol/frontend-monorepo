import { fireEvent, render, screen } from '@testing-library/react';

import { JsonRPCProvider } from '@/contexts/json-rpc/json-rpc-provider';
import { mockClient } from '@/test-helpers/mock-client';

import { locators as signMessageLocators } from './sign-message';
import {
  SignMessageDialog,
  SignMessageDialogProperties,
} from './sign-message-dialog';
import { locators as signedMessageLocators } from './signed-message';

const renderComponent = (properties: SignMessageDialogProperties) => {
  return render(
    <JsonRPCProvider>
      <SignMessageDialog {...properties} />
    </JsonRPCProvider>
  );
};

describe('SignMessageDialog', () => {
  beforeEach(() => {
    mockClient();
  });
  it('renders SignMessage component when signedMessage is null', () => {
    const mockOnClose = jest.fn();
    renderComponent({
      publicKey: 'test-public-key',
      onClose: mockOnClose,
      open: true,
    });

    expect(
      screen.getByTestId(signMessageLocators.signMessageHeader)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(signedMessageLocators.signedMessageHeader)
    ).not.toBeInTheDocument();
  });

  it('renders SignedMessage component when signedMessage is not null', async () => {
    // 1112-SIGN-001 There is a way to type a message from a key
    // 1112-SIGN-002 There is a way to "sign" the message from the key, creating a copyable encrypted message
    const mockOnClose = jest.fn();
    renderComponent({
      publicKey: 'test-public-key',
      onClose: mockOnClose,
      open: true,
    });
    const messageInput = screen.getByTestId(signMessageLocators.messageInput);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByTestId(signMessageLocators.signButton));

    await screen.findByTestId(signedMessageLocators.signedMessageHeader);
    expect(
      screen.getByTestId(signedMessageLocators.signedMessageHeader)
    ).toBeInTheDocument();
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    const messageText = screen.getByTestId('code-window').textContent;
    expect(messageText).toBeTruthy();
  });

  it('calls onClose and resets dialog when signMessage is cancelled', () => {
    const mockOnClose = jest.fn();
    renderComponent({
      publicKey: 'test-public-key',
      onClose: mockOnClose,
      open: true,
    });

    fireEvent.click(screen.getByTestId(signMessageLocators.cancelButton));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
