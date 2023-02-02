import { fireEvent, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { AddressField, TransferFee } from './transfer-form';

describe('AddressField', () => {
  const props = {
    pubKeys: ['pubkey-1', 'pubkey-2'],
    select: <div>select</div>,
    input: <div>input</div>,
    onChange: jest.fn(),
  };

  it('toggles content and calls onChange', async () => {
    const mockOnChange = jest.fn();
    render(<AddressField {...props} onChange={mockOnChange} />);

    // select should be shown as multiple pubkeys provided
    expect(screen.getByText('select')).toBeInTheDocument();
    expect(screen.queryByText('input')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Enter manually'));
    expect(screen.queryByText('select')).not.toBeInTheDocument();
    expect(screen.getByText('input')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Select from wallet'));
    expect(screen.getByText('select')).toBeInTheDocument();
    expect(screen.queryByText('input')).not.toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('Does not provide select option if there is only a single key', () => {
    render(<AddressField {...props} pubKeys={['single-pubKey']} />);
    expect(screen.getByText('input')).toBeInTheDocument();
    expect(screen.queryByText('Select from wallet')).not.toBeInTheDocument();
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
      .toFixed();
    expect(screen.getByTestId('transfer-fee')).toHaveTextContent(expected);
  });
});
