import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { PriceFlashCell } from './price-flash-cell';

describe('<PriceFlashCell />', () => {
  it('Displays formatted value', () => {
    render(<PriceFlashCell value={100} valueFormatted="100.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('100.00');
  });
  it('Displays 0', () => {
    render(<PriceFlashCell value={0} valueFormatted="0.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('0.00');
  });

  it('Displays - if value is not a number', () => {
    render(<PriceFlashCell value={null} valueFormatted="" />);
    expect(screen.getByTestId('price')).toHaveTextContent('-');
  });
});
