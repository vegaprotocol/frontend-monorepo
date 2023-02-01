import { fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { AddressField, TransferFee } from './transfer-form';

describe('AddressField', () => {
  it('toggles content and calls onChange', async () => {
    const mockOnChange = jest.fn();
    render(
      <AddressField
        defaultMode="input"
        select={<div>select</div>}
        input={<div>input</div>}
        onChange={mockOnChange}
      />
    );

    // input is default mode
    expect(screen.queryByText('select')).not.toBeInTheDocument();
    expect(screen.getByText('input')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Select from wallet'));
    expect(screen.getByText('select')).toBeInTheDocument();
    expect(screen.queryByText('input')).not.toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Enter manually'));
    expect(screen.queryByText('select')).not.toBeInTheDocument();
    expect(screen.getByText('input')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });
});

describe('TransferFee', () => {
  const props = {
    amount: '200',
    feeFactor: '0.001',
  };
  it('calculates and renders the transfer fee', () => {
    render(<TransferFee {...props} />);

    const expected = new BigNumber(props.amount)
      .times(props.feeFactor)
      .toString();
    expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expected);
  });
});
