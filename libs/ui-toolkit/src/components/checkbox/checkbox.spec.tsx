import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('should render checkbox with label successfully', () => {
    render(<Checkbox label="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should render a checked checkbox if specified in state', () => {
    render(<Checkbox label="checked" state={'checked'} />);
    expect(screen.getByTestId('checkbox-checked')).toBeInTheDocument();
  });

  it('should render an unchecked checkbox if specified in state', () => {
    render(<Checkbox label="unchecked" state={'unchecked'} />);
    expect(screen.getByTestId('checkbox-unchecked')).toBeInTheDocument();
  });

  it('should render an indeterminate checkbox if specified in state', () => {
    render(<Checkbox label="indeterminate" state={'indeterminate'} />);
    expect(screen.getByTestId('checkbox-indeterminate')).toBeInTheDocument();
  });

  it('should render a checkbox in error if specified', () => {
    render(<Checkbox label="error" error={true} />);
    expect(screen.getByTestId('checkbox-error')).toBeInTheDocument();
  });

  it('should render a checked checkbox in error if specified', () => {
    render(<Checkbox label="error-checked" state={'checked'} error={true} />);
    expect(screen.getByTestId('checkbox-error-checked')).toBeInTheDocument();
  });

  it('should render an unchecked checkbox in error if specified', () => {
    render(
      <Checkbox label="error-unchecked" state={'unchecked'} error={true} />
    );
    expect(screen.getByTestId('checkbox-error-unchecked')).toBeInTheDocument();
  });

  it('should render an indeterminate checkbox in error if specified', () => {
    render(
      <Checkbox
        label="error-indeterminate"
        state={'indeterminate'}
        error={true}
      />
    );
    expect(
      screen.getByTestId('checkbox-error-indeterminate')
    ).toBeInTheDocument();
  });

  it('fires callback on change if provided', () => {
    const callback = jest.fn();

    render(<Checkbox label="onchange" onChange={callback} />);

    const checkbox = screen.getByText('onchange');
    fireEvent.click(checkbox);
    expect(callback.mock.calls.length).toEqual(1);
  });
});
