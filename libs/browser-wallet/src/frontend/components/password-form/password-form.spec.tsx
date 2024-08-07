import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { REJECTION_ERROR_MESSAGE } from '@/lib/utils';

import { locators, PasswordForm } from './password-form';

describe('PasswordForm', () => {
  it('renders password input and submit button', () => {
    render(
      <PasswordForm
        onSubmit={jest.fn()}
        text="Export"
        loadingText="Exporting"
      />
    );
    expect(screen.getByTestId(locators.passphraseInput)).toBeInTheDocument();
    expect(screen.getByTestId(locators.passphraseSubmit)).toBeInTheDocument();
    expect(screen.getByTestId(locators.passphraseSubmit)).toBeDisabled();
    expect(screen.getByTestId(locators.passphraseSubmit)).toHaveTextContent(
      'Export'
    );
  });

  it('shows incorrect password text if password is entered incorrectly', async () => {
    render(
      <PasswordForm
        onSubmit={() => {
          throw new Error(REJECTION_ERROR_MESSAGE);
        }}
        text="Export"
        loadingText="Exporting"
      />
    );
    const passwordInput = screen.getByTestId(locators.passphraseInput);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId(locators.passphraseSubmit));
    await waitFor(() =>
      expect(screen.getByTestId('input-error-text')).toHaveTextContent(
        'Incorrect passphrase'
      )
    );
  });

  it('shows message unknown error occurs', async () => {
    render(
      <PasswordForm
        onSubmit={() => {
          throw new Error('foo');
        }}
        text="Export"
        loadingText="Exporting"
      />
    );
    const passwordInput = screen.getByTestId(locators.passphraseInput);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId(locators.passphraseSubmit));
    await waitFor(() =>
      expect(screen.getByTestId('input-error-text')).toHaveTextContent(
        'Unknown error occurred: foo'
      )
    );
  });
});
