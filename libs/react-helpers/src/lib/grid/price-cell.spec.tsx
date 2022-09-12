import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';

import { AgPriceFlashCell } from './price-flash-cell';

describe('<PriceFlashCell />', () => {
  it('Displays formatted value', () => {
    render(<AgPriceFlashCell value={100} valueFormatted="100.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('100.00');
  });
  it('Displays 0', () => {
    render(<AgPriceFlashCell value={0} valueFormatted="0.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('0.00');
  });

  it('Displays - if value is not a number', () => {
    render(<AgPriceFlashCell value={null} valueFormatted="" />);
    expect(screen.getByTestId('price')).toHaveTextContent('-');
  });
});
