import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { NumericCell } from './numeric-cell';

describe('NumericCell', () => {
  const testId = 'cell';
  it('Displays formatted value', () => {
    const valueFormatted = '111.00';
    render(
      <NumericCell
        value={111}
        valueFormatted={valueFormatted}
        testId={testId}
      />
    );
    expect(screen.getByTestId(testId)).toHaveTextContent(valueFormatted);
    expect(screen.getByText('00')).toBeInTheDocument();
    expect(screen.getByText('00')).toHaveClass('opacity-60');
  });

  it('Displays 0', () => {
    render(<NumericCell value={0} valueFormatted="0.00" testId={testId} />);
    expect(screen.getByTestId(testId)).toHaveTextContent('0.00');
  });

  it('Displays - if value is not a number', () => {
    render(<NumericCell value={null} valueFormatted="" testId={testId} />);
    expect(screen.getByTestId(testId)).toHaveTextContent('-');
  });
});
