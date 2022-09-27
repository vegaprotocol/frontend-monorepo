import { render, screen } from '@testing-library/react';
import { RemoveSignerForm } from './remove-signer-form';

describe('Remove Signer Form', () => {
  it('should render successfully', () => {
    render(<RemoveSignerForm />);
    expect(screen.getByTestId('remove-signer-input-input')).toBeInTheDocument();
    expect(screen.getByTestId('remove-signer-submit')).toBeInTheDocument();
  });

  // todo: write tests with mocked responses for transactions
});
