import { render, screen } from '@testing-library/react';
import { AddSignerForm } from './add-signer-form';

describe('Add Signer Form', () => {
  it('should render successfully', () => {
    render(<AddSignerForm />);
    expect(screen.getByTestId('add-signer-input-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-signer-submit')).toBeInTheDocument();
  });

  // todo: write tests with mocked responses for transactions
});
