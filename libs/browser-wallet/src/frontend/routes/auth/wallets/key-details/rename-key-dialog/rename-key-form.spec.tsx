import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { RpcMethods } from '@/lib/client-rpc-methods';

import { locators, RenameKeyForm } from './rename-key-form'; // Update the import path

const mockRequest = jest.fn().mockResolvedValue(null);

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: mockRequest,
  }),
}));

describe('RenameKeyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with input and submit button', () => {
    // 1125-KEYD-011 I can input the new name
    render(
      <RenameKeyForm
        onComplete={jest.fn()}
        keyName={'keyName'}
        publicKey="publicKey"
      />
    );

    const inputElement = screen.getByTestId(locators.renameKeyInput);
    const submitButton = screen.getByTestId(locators.renameKeySubmit);

    expect(inputElement).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('disables submit button when the form is empty', async () => {
    // 1125-KEYD-013 Submit button is disabled when key name is not entered
    render(
      <RenameKeyForm
        onComplete={jest.fn()}
        keyName={'keyName'}
        publicKey="publicKey"
      />
    );

    const submitButton = screen.getByTestId(locators.renameKeySubmit);

    expect(submitButton).toBeDisabled();
  });

  it('disables submit keyname is whitespace', async () => {
    // 1125-KEYD-017 Submit button is disabled when key name is only whitespace
    render(
      <RenameKeyForm
        onComplete={jest.fn()}
        keyName={'keyName'}
        publicKey="publicKey"
      />
    );

    const submitButton = screen.getByTestId(locators.renameKeySubmit);
    const inputElement = screen.getByTestId(locators.renameKeyInput);
    fireEvent.change(inputElement, {
      target: { value: '\t ' },
    });
    expect(submitButton).toBeDisabled();
    fireEvent.change(inputElement, {
      target: { value: 'something else' },
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('displays an error message when input is too long', async () => {
    // 1125-KEYD-014 Submit button is disabled when key name is longer than 30 chars
    // 1125-KEYD-015 I see an error message when I enter a key name longer than 30 chars
    render(
      <RenameKeyForm
        onComplete={jest.fn()}
        keyName={'keyName'}
        publicKey="publicKey"
      />
    );

    const inputElement = screen.getByTestId(locators.renameKeyInput);
    const submitButton = screen.getByTestId(locators.renameKeySubmit);

    fireEvent.change(inputElement, {
      target: { value: 'ThisIsAVeryLongKeyNameThatExceeds30Characters' },
    });
    fireEvent.click(submitButton);
    await screen.findByTestId('input-error-text');

    expect(screen.getByTestId('input-error-text')).toHaveTextContent(
      'Key name cannot be more than 30 character long'
    );

    expect(screen.getByTestId(locators.renameKeySubmit)).toBeDisabled();
  });

  it('calls the renameKey function with the new key name when submitted', async () => {
    const mockNewKeyName = 'NewKeyName';
    render(
      <RenameKeyForm
        onComplete={jest.fn()}
        keyName={'keyName'}
        publicKey="publicKey"
      />
    );

    const inputElement = screen.getByTestId(locators.renameKeyInput);
    const submitButton = screen.getByTestId(locators.renameKeySubmit);

    fireEvent.change(inputElement, { target: { value: mockNewKeyName } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());
    expect(mockRequest).toHaveBeenCalledWith(RpcMethods.RenameKey, {
      publicKey: 'publicKey',
      name: mockNewKeyName,
    });
  });

  it('calls onComplete when key is renamed', async () => {
    // 1125-KEYD-012 When I press submit the dialog closes
    const mockNewKeyName = 'NewKeyName';
    const onComplete = jest.fn();
    render(
      <RenameKeyForm
        onComplete={onComplete}
        keyName={'keyName'}
        publicKey="publicKey"
      />
    );
    const inputElement = screen.getByTestId(locators.renameKeyInput);
    const submitButton = screen.getByTestId(locators.renameKeySubmit);

    fireEvent.change(inputElement, { target: { value: mockNewKeyName } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(mockRequest).toHaveBeenCalled());
    expect(onComplete).toHaveBeenCalled();
  });
});
