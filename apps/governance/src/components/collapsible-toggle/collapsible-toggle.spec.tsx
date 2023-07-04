import { render, fireEvent } from '@testing-library/react';
import { CollapsibleToggle } from './collapsible-toggle';

describe('CollapsibleToggle', () => {
  const testId = 'collapsible-toggle';

  it('renders without crashing', () => {
    const mockSetToggleState = jest.fn();
    const { getByTestId, getByText } = render(
      <CollapsibleToggle
        toggleState={false}
        setToggleState={mockSetToggleState}
        dataTestId={testId}
      >
        <div>Test</div>
      </CollapsibleToggle>
    );

    expect(getByTestId(testId)).toBeInTheDocument();
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('calls setToggleState with the opposite of current toggleState when clicked', () => {
    const mockSetToggleState = jest.fn();
    const { getByTestId } = render(
      <CollapsibleToggle
        toggleState={false}
        setToggleState={mockSetToggleState}
        dataTestId={testId}
      >
        <div>Test</div>
      </CollapsibleToggle>
    );

    fireEvent.click(getByTestId(testId));

    expect(mockSetToggleState).toHaveBeenCalledWith(true);
  });

  it('has the rotate-180 class if toggleState is true', () => {
    const mockSetToggleState = jest.fn();
    const { getByTestId } = render(
      <CollapsibleToggle
        toggleState={true}
        setToggleState={mockSetToggleState}
        dataTestId={testId}
      >
        <div>Test</div>
      </CollapsibleToggle>
    );

    expect(getByTestId('toggle-icon-wrapper')).toHaveClass('rotate-180');
  });

  it('does not have the rotate-180 class if toggleState is false', () => {
    const mockSetToggleState = jest.fn();
    const { getByTestId } = render(
      <CollapsibleToggle
        toggleState={false}
        setToggleState={mockSetToggleState}
        dataTestId={testId}
      >
        <div>Test</div>
      </CollapsibleToggle>
    );

    expect(getByTestId('toggle-icon-wrapper')).not.toHaveClass('rotate-180');
  });
});
