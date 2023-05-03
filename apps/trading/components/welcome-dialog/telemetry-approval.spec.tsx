import { render, screen, act } from '@testing-library/react';
import { TelemetryApproval } from './telemetry-approval';

describe('TelemetryApproval', () => {
  it('click on checkbox should be properly handled', () => {
    const helpText = 'My help text';
    render(<TelemetryApproval helpText={helpText} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'data-state',
      'unchecked'
    );
    act(() => {
      screen.getByRole('checkbox').click();
    });
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'data-state',
      'checked'
    );
    expect(screen.getByText('Share usage data')).toBeInTheDocument();
    expect(screen.getByText(helpText)).toBeInTheDocument();
  });
});
