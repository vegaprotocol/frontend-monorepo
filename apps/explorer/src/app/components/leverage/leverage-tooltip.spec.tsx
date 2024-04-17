import { render } from '@testing-library/react';
import { LeverageTooltip } from './leverage-tooltip';

describe('LeverageTooltip', () => {
  it('renders the margin factor and leverage', () => {
    const marginFactor = '0.1';
    const leverage = '10';

    const { getByText } = render(
      <LeverageTooltip marginFactor={marginFactor} leverage={leverage} />
    );

    expect(getByText('Margin factor')).toBeInTheDocument();
    expect(getByText('0.1')).toBeInTheDocument();
    expect(getByText('Leverage')).toBeInTheDocument();
    expect(getByText('10×')).toBeInTheDocument();
  });
});
