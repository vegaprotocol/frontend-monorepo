import { fireEvent, render, screen } from '@testing-library/react';
import { TradingCheckbox } from './checkbox';

describe('Checkbox', () => {
  it('should render checkbox with label successfully', () => {
    render(<TradingCheckbox label="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should render a checked checkbox if specified in state', () => {
    render(<TradingCheckbox label="label" checked={true} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should render an unchecked checkbox if specified in state', () => {
    render(<TradingCheckbox label="unchecked" checked={false} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render an indeterminate checkbox if specified in state', () => {
    render(<TradingCheckbox label="indeterminate" checked="indeterminate" />);
    expect(screen.getByTestId('indeterminate-icon')).toBeInTheDocument();
  });

  it('fires callback on change if provided', () => {
    const callback = jest.fn();

    render(
      <TradingCheckbox
        name="test"
        label="onchange"
        onCheckedChange={callback}
      />
    );

    const checkbox = screen.getByText('onchange');
    fireEvent.click(checkbox);
    expect(callback).toHaveBeenCalled();
  });
});
