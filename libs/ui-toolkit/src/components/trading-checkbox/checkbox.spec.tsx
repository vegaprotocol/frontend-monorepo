import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('should render checkbox with label successfully', () => {
    render(<Checkbox label="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should render a checked checkbox if specified in state', () => {
    render(<Checkbox label="label" checked={true} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should render an unchecked checkbox if specified in state', () => {
    render(<Checkbox label="unchecked" checked={false} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render an indeterminate checkbox if specified in state', () => {
    render(<Checkbox label="indeterminate" checked="indeterminate" />);
    expect(screen.getByTestId('indeterminate-icon')).toBeInTheDocument();
  });

  it('fires callback on change if provided', () => {
    const callback = jest.fn();

    render(
      <Checkbox name="test" label="onchange" onCheckedChange={callback} />
    );

    const checkbox = screen.getByText('onchange');
    fireEvent.click(checkbox);
    expect(callback).toHaveBeenCalled();
  });
});
