import { render, screen } from '@testing-library/react';
import { AgPriceCellChange } from '..';

describe('AgPriceChangeCell', () => {
  it('should render correctly and calculates the price change', () => {
    render(
      <AgPriceCellChange
        candles={['45556', '678678', '23456']}
        decimalPlaces={3}
      />
    );
    expect(screen.getByText('-48.51%')).toBeInTheDocument();
    expect(screen.getByText('-22.100')).toBeInTheDocument();
  });

  it('should render correctly and calculates the price change without decimals', () => {
    render(<AgPriceCellChange candles={['45556', '678678', '23456']} />);
    expect(screen.getByText('-48.51%')).toBeInTheDocument();
    expect(screen.getByText('-22,100.000')).toBeInTheDocument();
  });
});
