import { render } from '@testing-library/react';
import { Leverage, type LeverageProps } from './leverage';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

describe('Leverage', () => {
  const renderComponent = (props: LeverageProps) => {
    return render(
      <TooltipProvider>
        <Leverage {...props} />
      </TooltipProvider>
    );
  };
  it('should render null if marginFactor is falsy or zero', () => {
    const { container } = renderComponent({ marginFactor: undefined });
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(<Leverage marginFactor={'0'} />);
    expect(container2.firstChild).toBeNull();
  });

  it('should render the correct leverage value - 0.5 (no insignificant 0s)', () => {
    const { container } = renderComponent({ marginFactor: '0.5' });
    expect(container.firstChild).toHaveTextContent('2×');
  });

  it('should render the correct leverage value - with rounding', () => {
    const { container } = renderComponent({ marginFactor: '0.43012' });
    expect(container.firstChild).toHaveTextContent('2.32×');
  });

  it('should render null if leverage is unreasonable', () => {
    const { container } = renderComponent({
      marginFactor: '0.000000000000000000000000000000000000000001',
    });
    expect(container.firstChild).toBeNull();
  });

  it('just below reasonable limit renders fine', () => {
    const { container } = renderComponent({ marginFactor: '0.001' });
    expect(container.firstChild).not.toBeNull();
  });

  it('just above reasonable limit renders nothing', () => {
    const { container } = renderComponent({ marginFactor: '0.0009' });
    expect(container.firstChild).toBeNull();
  });
});
