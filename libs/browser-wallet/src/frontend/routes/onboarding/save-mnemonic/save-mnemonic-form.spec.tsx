import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { locators, SaveMnemonicForm } from './save-mnemonic-form';

describe('SaveMnemonicForm', () => {
  const mockedOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(
      <SaveMnemonicForm
        onSubmit={mockedOnSubmit}
        loading={false}
        disabled={false}
      />
    );

    expect(
      screen.getByLabelText(
        'I understand that if I lose my recovery phrase, I lose access to my wallet and keys.'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId(locators.saveMnemonicButton)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted with accepted terms checked', async () => {
    render(
      <SaveMnemonicForm
        onSubmit={mockedOnSubmit}
        loading={false}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByTestId('acceptedTerms'));
    fireEvent.click(screen.getByTestId(locators.saveMnemonicButton));
    await waitFor(() => expect(mockedOnSubmit).toHaveBeenCalled());
  });

  it('does not call onSubmit when form is submitted with accepted terms unchecked', async () => {
    render(
      <SaveMnemonicForm
        onSubmit={mockedOnSubmit}
        loading={false}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByTestId(locators.saveMnemonicButton));
    await waitFor(() => expect(mockedOnSubmit).not.toHaveBeenCalled());
  });

  it('disables inputs when disabled is true', async () => {
    render(
      <SaveMnemonicForm
        onSubmit={mockedOnSubmit}
        loading={false}
        disabled={true}
      />
    );
    expect(screen.getByTestId('acceptedTerms')).toBeDisabled();
    expect(screen.getByTestId(locators.saveMnemonicButton)).toBeDisabled();
  });

  it('disables inputs when loading is true', async () => {
    render(
      <SaveMnemonicForm
        onSubmit={mockedOnSubmit}
        loading={true}
        disabled={false}
      />
    );
    expect(screen.getByTestId('acceptedTerms')).toBeDisabled();
    expect(screen.getByTestId(locators.saveMnemonicButton)).toBeDisabled();
  });
});
