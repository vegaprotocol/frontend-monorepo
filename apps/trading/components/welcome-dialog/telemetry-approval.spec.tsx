import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelemetryApproval } from './telemetry-approval';

describe('TelemetryApproval', () => {
  it('click on buttons should be properly handled', async () => {
    const mockSetTelemetryValue = jest.fn();
    render(
      <TelemetryApproval
        telemetryValue="false"
        setTelemetryValue={mockSetTelemetryValue}
      />
    );
    expect(
      screen.getByRole('button', { name: 'No thanks' })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'No thanks' }));
    expect(mockSetTelemetryValue).toHaveBeenCalledWith('false');
    expect(screen.getByText('Share data')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Share data'));
    expect(mockSetTelemetryValue).toHaveBeenCalledWith('true');
  });

  it('confirm button should have proper text', async () => {
    const mockSetTelemetryValue = jest.fn();
    render(
      <TelemetryApproval
        telemetryValue="true"
        setTelemetryValue={mockSetTelemetryValue}
      />
    );
    expect(screen.getByText('Continue sharing data')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Continue sharing data'));
    expect(mockSetTelemetryValue).toHaveBeenCalledWith('true');
  });
});
