import { render } from '@testing-library/react';
import { LiquidityProvisionMid } from './liquidity-provision-mid';

describe('LiquidityProvisionMid', () => {
  function renderComponent() {
    return render(
      <table>
        <tbody data-testid="container">
          <LiquidityProvisionMid />
        </tbody>
      </table>
    );
  }

  it('Renders a row', () => {
    const res = renderComponent();
    const display = res.getByTestId('mid-display');
    expect(res.getByTestId('mid')).toBeInTheDocument();
    expect(display).toBeInTheDocument();
    expect(display).toHaveAttribute('colspan', '3');
  });
});
