import { render, screen } from '@testing-library/react';
import { PriceChangeCell } from './price-change-cell';

describe('PriceChangeCell', () => {
  it('renders correctly and calculates the price change', () => {
    render(
      <PriceChangeCell
        candles={['45556', '678678', '23456']}
        decimalPlaces={3}
      />
    );
    expect(screen.getByText('-48.51%')).toBeInTheDocument();
    expect(screen.getByText('-22.100')).toBeInTheDocument();
  });

  it('renders correctly and calculates the price change without decimals', () => {
    render(<PriceChangeCell candles={['45556', '678678', '23456']} />);
    expect(screen.getByText('-48.51%')).toBeInTheDocument();
    expect(screen.getByText('-22,100.000')).toBeInTheDocument();
  });
});
