import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AgPriceFlashCell } from './price-flash-cell';

describe('AgPriceFlashCell', () => {
  it('should display formatted value', () => {
    render(<AgPriceFlashCell value={100} valueFormatted="100.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('100.00');
  });
  it('should display 0', () => {
    render(<AgPriceFlashCell value={0} valueFormatted="0.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('0.00');
  });

  it('should display - if value is not a number', () => {
    render(<AgPriceFlashCell value={null} valueFormatted="" />);
    expect(screen.getByTestId('price')).toHaveTextContent('-');
  });
});
