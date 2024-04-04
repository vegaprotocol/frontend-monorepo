import { render } from '@testing-library/react';
import { Leverage } from './leverage';

describe('Leverage', () => {
  it('should render null if marginFactor is falsy or zero', () => {
    const { container } = render(
      <Leverage marginFactor={null as unknown as string} />
    );
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(
      <Leverage marginFactor={0 as unknown as string} />
    );
    expect(container2.firstChild).toBeNull();
  });

  it('should render the correct leverage value - 0.5 (no insignificant 0s)', () => {
    const { container } = render(<Leverage marginFactor="0.5" />);
    expect(container.firstChild).toHaveTextContent('2×');
  });

  it('should render the correct leverage value - with rounding', () => {
    const { container } = render(<Leverage marginFactor="0.43012" />);
    expect(container.firstChild).toHaveTextContent('2.32×');
  });

  it('should render null if leverage is unreasonable', () => {
    const { container } = render(
      <Leverage marginFactor="0.000000000000000000000000000000000000000001" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('just below reasonable limit renders fine', () => {
    const { container } = render(<Leverage marginFactor="0.001" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('just above reasonable limit renders nothing', () => {
    const { container } = render(<Leverage marginFactor="0.0009" />);
    expect(container.firstChild).toBeNull();
  });
});
