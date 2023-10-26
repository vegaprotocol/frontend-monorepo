import { render, screen } from '@testing-library/react';
import { Sparkline } from './sparkline';
import type { SparklineProps } from './sparkline';

describe('Sparkline', () => {
  let props: SparklineProps = {
    data: [],
  };

  beforeEach(() => {
    props = {
      data: [
        1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 6, 7, 8,
        9, 10, 11, 12,
      ],
    };
  });

  it('Renders an svg with a single path', () => {
    render(<Sparkline {...props} />);
    expect(screen.getByTestId('sparkline-svg')).toBeInTheDocument();
    const paths = screen.getAllByTestId('sparkline-path');
    const path = paths[0];
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('d', expect.any(String));
    expect(path).toHaveAttribute('stroke-width', '1');
  });

  it('Requires a data prop but width and height are optional', () => {
    render(<Sparkline {...props} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '15');
  });

  it('Renders a red line if the last value is less than the first', () => {
    props.data[0] = 10;
    props.data[props.data.length - 1] = 5;
    render(<Sparkline {...props} />);
    const paths = screen.getAllByTestId('sparkline-path');
    const path = paths[0];
    expect(path).toHaveClass(
      '[vector-effect:non-scaling-stroke] stroke-market-red dark:stroke-market-red'
    );
  });

  it('Renders a green line if the last value is greater than the first', () => {
    props.data[0] = 5;
    props.data[props.data.length - 1] = 10;
    render(<Sparkline {...props} />);
    const paths = screen.getAllByTestId('sparkline-path');
    const path = paths[0];
    expect(path).toHaveClass(
      '[vector-effect:non-scaling-stroke] stroke-market-green-600 dark:stroke-market-green'
    );
  });

  it('Renders a white line if the first and last values are equal', () => {
    props.data[0] = 5;
    props.data[props.data.length - 1] = 5;
    render(<Sparkline {...props} />);
    const paths = screen.getAllByTestId('sparkline-path');
    const path = paths[0];
    expect(path).toHaveClass(
      '[vector-effect:non-scaling-stroke] stroke-black/40 dark:stroke-white/40'
    );
  });
});
