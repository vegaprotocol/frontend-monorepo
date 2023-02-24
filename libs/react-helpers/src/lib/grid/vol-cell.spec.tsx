import { render, screen } from '@testing-library/react';
import { VolCell, VolumeType } from './vol-cell';
import * as tailwind from '@vegaprotocol/tailwindcss-config';

describe('VolCell', () => {
  const significantPart = '12,345';
  const decimalPart = '67';
  const props = {
    value: 1234567,
    valueFormatted: `${significantPart}.${decimalPart}`,
    type: VolumeType.ask,
    testId: 'cell',
  };

  it('Displays formatted value', () => {
    render(<VolCell {...props} />);
    expect(screen.getByTestId(props.testId)).toHaveTextContent(
      props.valueFormatted
    );
    expect(screen.getByText(decimalPart)).toBeInTheDocument();
    expect(screen.getByText(decimalPart)).toHaveClass('opacity-60');
  });

  it('Displays 0', () => {
    render(<VolCell {...props} value={0} valueFormatted="0.00" />);
    expect(screen.getByTestId(props.testId)).toHaveTextContent('0.00');
  });

  it('Displays - if value is not a number', () => {
    render(<VolCell {...props} value={null} valueFormatted="" />);
    expect(screen.getByTestId(props.testId)).toHaveTextContent('-');
  });

  it('renders bid volume bar', () => {
    render(<VolCell {...props} type={VolumeType.bid} />);
    expect(screen.getByTestId('vol-bar')).toHaveClass('left-0'); // renders bid bars from the left
    expect(screen.getByTestId('vol-bar')).toHaveStyle({
      backgroundColor: tailwind.theme.colors.vega.green.DEFAULT,
    });
  });

  it('renders ask volume bar', () => {
    render(<VolCell {...props} type={VolumeType.ask} />);
    expect(screen.getByTestId('vol-bar')).toHaveClass('right-0'); // renders ask bars from the right
    expect(screen.getByTestId('vol-bar')).toHaveStyle({
      backgroundColor: tailwind.theme.colors.vega.pink.DEFAULT,
    });
  });
});
