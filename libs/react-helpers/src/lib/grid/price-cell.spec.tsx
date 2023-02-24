import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PriceCell } from './price-cell';

describe('PriceCell', () => {
  it('Displays formatted value', () => {
    render(<PriceCell value={100} valueFormatted="100.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('100.00');
    expect(screen.getByTestId('price')).toHaveAttribute('title', '100.00');
  });

  it('Displays 0', () => {
    render(<PriceCell value={0} valueFormatted="0.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('0.00');
  });

  it('Displays - if value is not a number', () => {
    render(<PriceCell value={null} valueFormatted="" />);
    expect(screen.getByTestId('price')).toHaveTextContent('-');
  });

  it('can be clicked if given an onClick handler', async () => {
    const mockOnClick = jest.fn();
    const value = 100;
    render(
      <PriceCell value={value} valueFormatted="100.00" onClick={mockOnClick} />
    );
    await userEvent.click(screen.getByTestId('price'));
    expect(mockOnClick).toHaveBeenCalledWith(value);
  });
});
