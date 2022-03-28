import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';

import { PriceCell } from './price-cell';

describe('<PriceCell />', () => {
  it('Displayes formatted value', () => {
    render(<PriceCell value={100} valueFormatted="100.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('100.00');
  });
  it('Displayes 0', () => {
    render(<PriceCell value={0} valueFormatted="0.00" />);
    expect(screen.getByTestId('price')).toHaveTextContent('0.00');
  });

  it('Displayes - if value is not a number', () => {
    render(<PriceCell value={null} valueFormatted="" />);
    expect(screen.getByTestId('price')).toHaveTextContent('-');
  });
});
